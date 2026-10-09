"""LZW codec — reference implementation."""

from __future__ import annotations

from typing import List


def compress(data: str) -> List[int]:
    """Encode a string into LZW code integers."""
    if not isinstance(data, str):
        raise TypeError("compress() expects a str")

    dictionary: dict[str, int] = {chr(i): i for i in range(256)}
    next_code = 256
    result: List[int] = []
    w = ""

    for ch in data:
        wc = w + ch
        if wc in dictionary:
            w = wc
        else:
            result.append(dictionary[w])
            dictionary[wc] = next_code
            next_code += 1
            w = ch

    if w:
        result.append(dictionary[w])

    return result


def decompress(codes: List[int]) -> str:
    """Decode LZW code integers back into a string."""
    if not isinstance(codes, list):
        raise TypeError("decompress() expects a list of ints")
    if not codes:
        return ""

    dictionary: dict[int, str] = {i: chr(i) for i in range(256)}
    next_code = 256
    w = dictionary[codes[0]]
    out = [w]

    for k in codes[1:]:
        if k in dictionary:
            entry = dictionary[k]
        elif k == next_code:
            entry = w + w[0]
        else:
            raise ValueError(f"invalid code {k}")
        out.append(entry)
        dictionary[next_code] = w + entry[0]
        next_code += 1
        w = entry

    return "".join(out)


if __name__ == "__main__":
    sample = "TOBEORNOTTOBEORTOBEORNOT"
    encoded = compress(sample)
    assert encoded == [84, 79, 66, 69, 79, 82, 78, 79, 84,
                       256, 258, 260, 265, 259, 261, 263]
    assert decompress(encoded) == sample
    print("python reference: ok")
