"""
Long-running voice control daemon: listens for the wake word on the default
microphone, records the command that follows, transcribes it locally with
whisper.cpp, and turns it into a reminder or to-do via intent.py.

Runs standalone (`python3 daemon.py`), independent of the Electron app's
lifecycle -- see the systemd unit in this directory for Pi deployment.
"""

import os
import re
import sys
import tempfile
import time
import uuid
import wave
from datetime import datetime

import numpy as np
import pyaudio
import requests
import webrtcvad
from dotenv import load_dotenv
from openwakeword.model import Model as WakeModel
from pywhispercpp.model import Model as WhisperModel

from intent import parse_intent

load_dotenv()

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:4000/api")
WAKEWORD_MODEL_PATH = os.environ.get("WAKEWORD_MODEL_PATH", "").strip()
INPUT_DEVICE_NAME = os.environ.get("INPUT_DEVICE_NAME", "").strip()

SAMPLE_RATE = 16000
CHUNK_SAMPLES = 1280  # 80ms, openWakeWord's expected chunk size
CHUNK_BYTES = CHUNK_SAMPLES * 2  # int16
VAD_FRAME_BYTES = 640  # 20ms at 16kHz/int16 -- webrtcvad only accepts 10/20/30ms frames
WAKE_THRESHOLD = 0.5
SILENCE_LIMIT_SEC = 2.0  # room to pause between items when listing several
MAX_RECORD_SEC = 30
RESULT_DISPLAY_SEC = 3  # how long the popup shows what it captured before closing
NO_MATCH_DISPLAY_SEC = 1.5

# whisper.cpp hallucinates bracketed/parenthesized markers like "[BLANK_AUDIO]"
# on silence or noise -- catch a false wake-word trigger before it turns into
# a junk checklist item (parse_intent treats any non-empty text as a to-do).
BLANK_AUDIO_MARKERS = re.compile(
    r"^[\[\(]\s*(blank[ _]?audio|silence|no speech|inaudible|music|pause)\s*[\]\)]\.?$",
    flags=re.IGNORECASE,
)
CANCEL_CHECK_EVERY_N_CHUNKS = 3  # ~240ms between polls -- frequent enough to feel instant, cheap on localhost


def find_input_device(audio: pyaudio.PyAudio) -> int:
    """Resolves which input device to use: INPUT_DEVICE_NAME (substring match)
    if set, else the system default, else the first available input device."""
    if INPUT_DEVICE_NAME:
        for i in range(audio.get_device_count()):
            info = audio.get_device_info_by_index(i)
            if info.get("maxInputChannels", 0) > 0 and INPUT_DEVICE_NAME.lower() in info.get("name", "").lower():
                print(f"[voice] Using input device {i}: {info.get('name')}")
                return i
        print(
            f"[voice] No input device matching INPUT_DEVICE_NAME={INPUT_DEVICE_NAME!r} -- "
            "falling back to the system default input.",
            file=sys.stderr,
        )

    try:
        info = audio.get_default_input_device_info()
        print(f"[voice] Using default input device: {info.get('name')}")
        return info["index"]
    except IOError:
        pass

    for i in range(audio.get_device_count()):
        info = audio.get_device_info_by_index(i)
        if info.get("maxInputChannels", 0) > 0:
            print(f"[voice] No default input device -- using first available: {info.get('name')}")
            return i

    raise RuntimeError("No input audio device available")


def load_wake_model() -> tuple[WakeModel, str]:
    if WAKEWORD_MODEL_PATH and os.path.isfile(WAKEWORD_MODEL_PATH):
        model_key = os.path.splitext(os.path.basename(WAKEWORD_MODEL_PATH))[0]
        return WakeModel(wakeword_models=[WAKEWORD_MODEL_PATH], inference_framework="onnx"), model_key
    print(
        "[voice] WAKEWORD_MODEL_PATH not set or file missing -- falling back to "
        "the bundled 'hey_jarvis' model. Train 'Hey Bumbercatch' and set "
        "WAKEWORD_MODEL_PATH once ready.",
        file=sys.stderr,
    )
    return WakeModel(wakeword_models=["hey_jarvis"], inference_framework="onnx"), "hey_jarvis"


def is_speech(frame_bytes: bytes, vad: webrtcvad.Vad) -> bool:
    for i in range(0, len(frame_bytes) - VAD_FRAME_BYTES + 1, VAD_FRAME_BYTES):
        sub_frame = frame_bytes[i : i + VAD_FRAME_BYTES]
        if vad.is_speech(sub_frame, SAMPLE_RATE):
            return True
    return False


def is_cancel_requested() -> bool:
    try:
        resp = requests.get(f"{API_BASE_URL}/voice/cancel", timeout=2)
        resp.raise_for_status()
        return bool(resp.json().get("cancel"))
    except requests.RequestException:
        return False


def record_command(stream: pyaudio.Stream, vad: webrtcvad.Vad) -> bytes | None:
    """Returns the recorded PCM bytes, or None if the user cancelled via the
    frontend (POST /api/voice/cancel) while this was recording."""
    print("[voice] Listening for a command...")
    frames: list[bytes] = []
    elapsed = 0.0
    silence_elapsed = 0.0
    speech_started = False
    chunk_count = 0

    while elapsed < MAX_RECORD_SEC:
        data = stream.read(CHUNK_SAMPLES, exception_on_overflow=False)
        frames.append(data)
        elapsed += CHUNK_SAMPLES / SAMPLE_RATE

        chunk_count += 1
        if chunk_count % CANCEL_CHECK_EVERY_N_CHUNKS == 0 and is_cancel_requested():
            print("[voice] Recording cancelled.")
            return None

        if is_speech(data, vad):
            speech_started = True
            silence_elapsed = 0.0
        elif speech_started:
            silence_elapsed += CHUNK_SAMPLES / SAMPLE_RATE
            if silence_elapsed >= SILENCE_LIMIT_SEC:
                break

    return b"".join(frames)


def is_blank_transcript(text: str) -> bool:
    stripped = text.strip()
    return not stripped or bool(BLANK_AUDIO_MARKERS.match(stripped))


def format_due_time(due_at_iso: str) -> str:
    dt = datetime.fromisoformat(due_at_iso)
    return dt.strftime("%-I:%M %p")


def format_result_lines(intents: list[dict]) -> list[str]:
    lines = []
    for intent in intents:
        if intent["type"] == "reminder":
            lines.append(f"Reminding {intent['label']} at {format_due_time(intent['dueAt'])}")
        else:
            lines.append(f"Adding {intent['label']} to checklist")
    return lines


def transcribe(whisper_model: WhisperModel, pcm_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        with wave.open(tmp_path, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(pcm_bytes)
        segments = whisper_model.transcribe(tmp_path)
        return " ".join(segment.text for segment in segments).strip()
    finally:
        os.remove(tmp_path)


def submit_intent(intent: dict) -> None:
    try:
        if intent["type"] == "reminder":
            requests.post(
                f"{API_BASE_URL}/reminders",
                json={"label": intent["label"], "dueAt": intent["dueAt"], "source": "voice"},
                timeout=5,
            ).raise_for_status()
        elif intent["type"] == "checklist":
            requests.post(
                f"{API_BASE_URL}/checklist",
                json={"id": str(uuid.uuid4()), "label": intent["label"], "checked": False, "source": "Voice"},
                timeout=5,
            ).raise_for_status()
        print(f"[voice] Submitted: {intent}")
    except requests.RequestException as exc:
        print(f"[voice] Failed to submit intent to backend: {exc}", file=sys.stderr)


def submit_intents(intents: list[dict]) -> None:
    for intent in intents:
        submit_intent(intent)


def set_listening(active: bool, label: str, voice_result: str | None = None) -> None:
    try:
        requests.patch(
            f"{API_BASE_URL}/home-status",
            json={"listening": {"active": active, "label": label}, "voiceResult": voice_result},
            timeout=5,
        ).raise_for_status()
    except requests.RequestException as exc:
        print(f"[voice] Failed to update listening status: {exc}", file=sys.stderr)


def main() -> None:
    wake_model, wake_key = load_wake_model()
    whisper_model = WhisperModel("base")
    vad = webrtcvad.Vad(3)

    audio = pyaudio.PyAudio()
    device_index = find_input_device(audio)
    stream = audio.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=SAMPLE_RATE,
        input=True,
        input_device_index=device_index,
        frames_per_buffer=CHUNK_SAMPLES,
    )

    print(f"[voice] Listening for wake word ('{wake_key}')...")
    set_listening(False, "Idle")
    try:
        while True:
            data = stream.read(CHUNK_SAMPLES, exception_on_overflow=False)
            chunk = np.frombuffer(data, dtype=np.int16)
            predictions = wake_model.predict(chunk)

            if any(score > WAKE_THRESHOLD for score in predictions.values()):
                print("[voice] Wake word detected!")
                is_cancel_requested()  # flush any stale cancel from before this trigger
                set_listening(True, "Listening")
                try:
                    pcm_bytes = record_command(stream, vad)
                    if pcm_bytes is None:
                        pass  # cancelled -- fall through to finally, nothing to transcribe
                    else:
                        set_listening(True, "Processing...")
                        text = transcribe(whisper_model, pcm_bytes)
                        print(f"[voice] Heard: {text!r}")

                        if is_blank_transcript(text):
                            print("[voice] Heard nothing usable -- resuming.")
                            set_listening(True, "Listening", voice_result="Didn't catch that")
                            time.sleep(NO_MATCH_DISPLAY_SEC)
                        else:
                            intents = parse_intent(text)
                            if intents:
                                submit_intents(intents)
                                set_listening(True, "Listening", voice_result="\n".join(format_result_lines(intents)))
                                time.sleep(RESULT_DISPLAY_SEC)
                            else:
                                print("[voice] Didn't understand that -- resuming.")
                                set_listening(True, "Listening", voice_result="Didn't catch that")
                                time.sleep(NO_MATCH_DISPLAY_SEC)
                finally:
                    set_listening(False, "Idle")
                wake_model.reset()
    except KeyboardInterrupt:
        pass
    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()


if __name__ == "__main__":
    main()
