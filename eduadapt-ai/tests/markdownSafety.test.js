import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isSafeMarkdownUrl } from "../src/lib/markdownSafety.js";

const markdownSource = readFileSync(new URL("../src/lib/markdown.jsx", import.meta.url), "utf8");

describe("Markdown output safety", () => {
  test("allows only HTTP and HTTPS links", () => {
    assert.equal(isSafeMarkdownUrl("https://example.com"), true);
    assert.equal(isSafeMarkdownUrl("http://example.com/path"), true);
    assert.equal(isSafeMarkdownUrl("javascript:alert(1)"), false);
    assert.equal(isSafeMarkdownUrl("data:text/html,bad"), false);
    assert.equal(isSafeMarkdownUrl("file:///etc/passwd"), false);
    assert.equal(isSafeMarkdownUrl(null), false);
  });

  test("renders model text as React elements rather than injecting raw HTML", () => {
    assert.match(markdownSource, /return <div className="md">/);
    assert.doesNotMatch(markdownSource, /dangerouslySetInnerHTML|\.innerHTML\s*=/);
    assert.match(markdownSource, /rel="noopener noreferrer"/);
    assert.match(markdownSource, /isSafeMarkdownUrl\(link\[2\]\)/);
  });
});
