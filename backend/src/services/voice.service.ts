// In-memory only: a single kiosk process, one voice daemon, one flag. Lets the
// frontend ask the voice daemon (backend/python/voice/daemon.py) to abort a
// recording in progress when the user dismisses the "Listening" popup early.
let cancelRequested = false;

export function requestVoiceCancel(): void {
  cancelRequested = true;
}

export function consumeVoiceCancel(): boolean {
  const wasRequested = cancelRequested;
  cancelRequested = false;
  return wasRequested;
}
