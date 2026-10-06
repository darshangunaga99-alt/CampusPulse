"""Text normalisation helpers used by the AI fallback, duplicate and recurring engines."""
import re

STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "in", "on", "at", "of", "to", "for",
    "and", "or", "it", "its", "this", "that", "my", "our", "we", "i", "me", "us", "you", "please",
    "since", "from", "with", "there", "here", "has", "have", "had", "very", "also", "so", "all",
    "any", "some", "again", "still", "today", "now", "room", "floor", "block", "building", "near",
    "college", "campus", "hi", "hello", "sir", "madam", "kindly", "help", "issue", "problem",
}

# Phrase-level canonicalisation: different wordings of the same concept collapse to one token.
_PHRASES: list[tuple[str, str]] = [
    (r"\bwi[\s\-]?fi\b", " network "),
    (r"\b(internet|network|connectivity|connection|lan|ethernet|hotspot|net)\b", " network "),
    (
        r"\b(not working|isn'?t working|doesn'?t work|stopped working|is down|went down|are down|down|"
        r"outage|broken|not functioning|dead|failed|failure|faulty|cannot connect|can'?t connect|"
        r"unable to connect|no access|not connecting|disconnected|keeps disconnecting|no signal)\b",
        " failure ",
    ),
    (r"\b(leak|leaking|leakage|dripping)\b", " leak "),
    (r"\b(electricity|power|current)\b", " power "),
    (r"\b(pc|pcs|computer|computers|desktop|desktops)\b", " computer "),
    (r"\b(projector|projectors|beamer)\b", " projector "),
    (r"\b(ac|a\.c\.|air ?conditioner|air ?conditioning)\b", " ac "),
]


def canonicalize(text: str) -> str:
    t = text.lower()
    for pattern, repl in _PHRASES:
        t = re.sub(pattern, repl, t)
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def tokens(text: str) -> set[str]:
    return {w for w in canonicalize(text).split() if w not in STOPWORDS and len(w) > 1}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def normalize_place(value: str | None) -> str | None:
    """'Block B', 'B Block', 'b-block' -> 'b block' (order-insensitive)."""
    if not value:
        return None
    parts = re.sub(r"[^a-z0-9\s]", " ", value.lower()).split()
    return " ".join(sorted(parts)) or None


def escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
