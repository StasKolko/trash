export function toSlug(value: string): string {
  const transliterated = transliterateForSlug(value);

  return transliterated
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function transliterateForSlug(value: string): string {
  let result = "";
  for (const ch of value) {
    result += slugTransliterateChar(ch);
  }
  return result;
}

function slugTransliterateChar(ch: string): string {
  const lower = ch.toLowerCase();
  const mapped = SLUG_TRANSLIT_MAP[lower];
  if (mapped === undefined) return lower;
  return mapped;
}

const SLUG_TRANSLIT_MAP: Record<string, string> = {
  // Русские буквы
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",

  // Латиница (оставляем как есть)
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  f: "f",
  g: "g",
  h: "h",
  i: "i",
  j: "j",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  o: "o",
  p: "p",
  q: "q",
  r: "r",
  s: "s",
  t: "t",
  u: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "y",
  z: "z",

  // Пробел и подчёркивание -> дефис
  " ": "-",
  ",": "-",
  ".": "-",
  _: "-",
};
