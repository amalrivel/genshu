import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

function luminance(hex: string) {
  const rgb = hex
    .match(/\w\w/g)!
    .map((pair) => parseInt(pair, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
for (const theme of [":root", ".dark"]) {
  test(`${theme} text and control tokens meet contrast targets`, () => {
    const block = css.slice(css.indexOf(`${theme} {`)).split("}")[0];
    const tokens = Object.fromEntries(
      [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]),
    );
    for (const [text, background] of [
      ["foreground", "background"],
      ["card-foreground", "card"],
      ["muted-foreground", "muted"],
      ["muted-foreground", "card"],
      ["primary-foreground", "primary"],
      ["accent-foreground", "accent"],
      ["success", "success-background"],
      ["warning", "warning-background"],
      ["destructive", "card"],
    ])
      expect(contrast(tokens[text], tokens[background])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens.input, tokens.card)).toBeGreaterThanOrEqual(3);
    expect(contrast(tokens.ring, tokens.background)).toBeGreaterThanOrEqual(3);
  });
}
