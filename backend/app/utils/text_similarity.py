"""Text similarity utilities."""

import math
import re
from collections import Counter
from typing import Set


def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def tokenize(text: str) -> Set[str]:
    return set(normalize_text(text).split())


def jaccard_similarity(a: str, b: str) -> float:
    ta, tb = tokenize(a), tokenize(b)
    if not ta or not tb:
        return 0.0
    intersection = len(ta & tb)
    union = len(ta | tb)
    return intersection / union if union else 0.0


def cosine_similarity_tfidf(a: str, b: str) -> float:
    ta = normalize_text(a).split()
    tb = normalize_text(b).split()
    if not ta or not tb:
        return 0.0
    vocab = set(ta) | set(tb)
    ca, cb = Counter(ta), Counter(tb)
    dot = sum(ca[w] * cb[w] for w in vocab)
    na = math.sqrt(sum(v * v for v in ca.values()))
    nb = math.sqrt(sum(v * v for v in cb.values()))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)
