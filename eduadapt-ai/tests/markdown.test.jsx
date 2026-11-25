import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "../src/lib/markdown";

const html = (text) => renderToStaticMarkup(<Markdown text={text} />);

describe("Markdown renderer", () => {
  it("renders headings, bold, italic and inline code", () => {
    const out = html("## Title\n\nA **bold** and *soft* word with `code`.");
    expect(out).toContain("<h3");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>soft</em>");
    expect(out).toContain('class="md-inline"');
  });
  it("renders ordered and unordered lists", () => {
    expect(html("- a\n- b")).toContain("<ul>");
    expect(html("1. a\n2. b")).toContain("<ol>");
  });
  it("renders fenced code blocks with the language label", () => {
    const out = html("```sql\nSELECT 1;\n```");
    expect(out).toContain("sql");
    expect(out).toContain("SELECT 1;");
  });
  it("handles an unclosed code fence while streaming", () => {
    expect(html("```js\nconst a = 1;")).toContain("const a = 1;");
  });
  it("renders tables", () => {
    const out = html("| A | B |\n|---|---|\n| 1 | 2 |");
    expect(out).toContain("<table>");
    expect(out).toContain("<th>");
    expect(out).toContain("<td>");
  });
  it("never injects raw HTML", () => {
    const out = html("<script>alert(1)</script> <img src=x onerror=alert(1)>");
    expect(out).not.toContain("<script>");
    expect(out).not.toContain("<img");
  });
  it("only links http(s) URLs", () => {
    expect(html("[ok](https://example.com)")).toContain('href="https://example.com"');
    expect(html("[bad](javascript:alert(1))")).not.toContain("href=");
  });
  it("always terminates on odd input", () => {
    expect(() => html("```js foo\n##### x\n> \n| |")).not.toThrow();
  });
});
