// Every language has every text of the English table, with the same placeholders.
import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS } = load();
const LANGS = ["en", "fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl", "ro", "da", "sv", "bg", "ru", "uk", "hu", "sk", "cs", "sl", "lv", "el"];
const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("the 22 languages are there, no other", () => {
  assert.deepEqual([...Object.keys(STRINGS)].sort(), [...LANGS].sort());
});

for (const l of LANGS.slice(1)) {
  test(`${l}: every text translated, same placeholders`, () => {
    for (const [k, v] of Object.entries(STRINGS.en)) {
      assert.ok(Object.hasOwn(STRINGS[l], k), `${l}.${k} missing`);
      assert.deepEqual(vars(STRINGS[l][k]), vars(v), `${l}.${k} placeholders`);
    }
    assert.deepEqual(Object.keys(STRINGS[l]).filter((k) => !(k in STRINGS.en)), []);
  });
}
