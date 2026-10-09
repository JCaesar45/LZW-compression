export type Codes = number[];

const INITIAL_DICT_SIZE = 256;

export function compress(input: string): Codes {
  if (typeof input !== "string") {
    throw new TypeError("compress() expects a string");
  }

  const dict = new Map<string, number>();
  for (let i = 0; i < INITIAL_DICT_SIZE; i++) {
    dict.set(String.fromCharCode(i), i);
  }

  let next = INITIAL_DICT_SIZE;
  const out: Codes = [];
  let w = "";

  for (const ch of input) {
    const wc = w + ch;
    if (dict.has(wc)) {
      w = wc;
    } else {
      out.push(dict.get(w)!);
      dict.set(wc, next++);
      w = ch;
    }
  }

  if (w.length > 0) out.push(dict.get(w)!);
  return out;
}

export function decompress(codes: Codes): string {
  if (!Array.isArray(codes)) {
    throw new TypeError("decompress() expects number[]");
  }
  if (codes.length === 0) return "";

  const dict = new Map<number, string>();
  for (let i = 0; i < INITIAL_DICT_SIZE; i++) {
    dict.set(i, String.fromCharCode(i));
  }

  let next = INITIAL_DICT_SIZE;
  let w = dict.get(codes[0])!;
  const parts: string[] = [w];

  for (let i = 1; i < codes.length; i++) {
    const k = codes[i];
    let entry: string;

    if (dict.has(k)) {
      entry = dict.get(k)!;
    } else if (k === next) {
      entry = w + w[0];
    } else {
      throw new Error(`invalid LZW code: ${k}`);
    }

    parts.push(entry);
    dict.set(next++, w + entry[0]);
    w = entry;
  }

  return parts.join("");
}
