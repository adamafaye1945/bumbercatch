"""
Turns a transcribed sentence into one or more structured reminders/to-dos,
fully locally -- no network call. Uses regex to classify the sentence and
extract the actual task text (handling phrasing like "add MILK to my list",
not just exact trigger substrings), dateparser to find/parse any date-time
phrase embedded in that extracted text, and a list-separator split so one
utterance ("remind me to call mom and call dad tomorrow at 5pm") can produce
several items.
"""

import re
from typing import Optional, TypedDict

import dateparser.search

# Order matters: more specific ("remind me to") before more general ("remind me").
REMINDER_PATTERNS = [
    r"remind me to (.+)",
    r"remind me (.+)",
    r"set a reminder to (.+)",
    r"set a reminder (.+)",
]
TODO_PATTERNS = [
    r"add (.+) to (?:my )?(?:to-?do )?list",
    r"put (.+) on (?:my )?(?:to-?do )?list",
]

# dateparser sometimes matches only part of a time phrase (e.g. "at 8pm" out of
# "tonight at 8pm"), leaving a dangling relative-day word behind in the label.
LEFTOVER_TIME_WORDS = re.compile(
    r"\b(tonight|today|tomorrow|this morning|this afternoon|this evening)\b\s*$",
    flags=re.IGNORECASE,
)

# Splits a spoken list of items on commas and "and" -- lets one utterance like
# "remind me to call mom and call dad tomorrow at 5pm" or "add milk, eggs,
# and bread to my list" become several separate reminders/to-dos. Known
# limitation: this also splits a genuine multi-word item like "mac and
# cheese" -- an inherent ambiguity of rule-based parsing, not worth solving
# with a hardcoded exception list.
LIST_SEPARATOR = re.compile(r"\s*,\s*(?:and\s+)?|\s+and\s+", flags=re.IGNORECASE)


class Intent(TypedDict, total=False):
    type: str  # "reminder" | "checklist"
    label: str
    dueAt: str  # only present for "reminder"


def _first_match(patterns: list[str], text: str) -> Optional[str]:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip(" .,")
    return None


def _extract_due_at(text: str) -> tuple[Optional[str], str]:
    """Returns (dueAt ISO string or None, text with the matched date phrase removed)."""
    # languages=["en"] matters a lot here: without it, dateparser's search
    # can match unrelated short words (e.g. "me", "set") as spurious dates.
    found = dateparser.search.search_dates(
        text, languages=["en"], settings={"PREFER_DATES_FROM": "future"}
    )
    if not found:
        return None, text
    matched_text, dt = found[0]
    remaining = text.replace(matched_text, "").strip(" .,")
    remaining = LEFTOVER_TIME_WORDS.sub("", remaining).strip(" .,")
    return dt.isoformat(), remaining


def _split_items(text: str) -> list[str]:
    """Splits a spoken list ("milk, eggs, and bread" / "call mom and call dad")
    into individual items. Text with no separators comes back as one item."""
    return [item for item in (part.strip(" .,") for part in LIST_SEPARATOR.split(text)) if item]


def parse_intent(text: str) -> Optional[list[Intent]]:
    text = text.strip()
    if not text:
        return None

    reminder_body = _first_match(REMINDER_PATTERNS, text)
    if reminder_body:
        due_at, label_text = _extract_due_at(reminder_body)
        items = _split_items(label_text)
        if not items:
            return None
        item_type = "reminder" if due_at else "checklist"
        intents: list[Intent] = []
        for item in items:
            intent: Intent = {"type": item_type, "label": item.capitalize()}
            if due_at:
                intent["dueAt"] = due_at
            intents.append(intent)
        return intents

    todo_body = _first_match(TODO_PATTERNS, text)
    if todo_body:
        items = _split_items(todo_body)
        if not items:
            return None
        return [{"type": "checklist", "label": item.capitalize()} for item in items]

    # No "remind me"/"set a reminder" trigger -- assume the utterance is meant
    # as one or more to-do items rather than discarding it outright.
    items = _split_items(text)
    if not items:
        return None
    do_list =  [{"type": "checklist", "label": item.capitalize()} for item in items]
    return do_list