import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Small, dependency-free Markdown renderer. Builds React elements only (no raw HTML),
// so model output can never inject markup. Tolerates half-finished text while streaming.

const INLINE_RE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\s][^*\n]*\*|\[[^\]\n]+\]\([^)\s]+\))/g;

function renderInline(text, keyPrefix) {
  const parts = text.split(INLINE_RE);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={key} className="md-inline">{part.slice(1, -1)}</code>;
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      if (part.length > 4) return <strong key={key}>{renderInline(part.slice(2, -2), key)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={key}>{renderInline(part.slice(1, -1), key)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const safe = /^https?:\/\//i.test(link[2]);
      return safe ? <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a> : <span key={key}>{link[1]}</span>;
    }
    return part;
  });
}

export function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  }
  return (
    <div className="md-code">
      <div className="md-code-head">
        <span>{lang || "code"}</span>
        <button type="button" onClick={copy} aria-label="Copy code">
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy code</>}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function splitRow(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
}

export default function Markdown({ text }) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    const fence = line.match(/^\s*```\s*([\w+#.-]*)\s*$/);
    if (fence) {
      const code = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { code.push(lines[i]); i++; }
      i++;
      blocks.push(<CodeBlock key={k++} code={code.join("\n")} lang={fence[1]} />);
      continue;
    }

    if (!line.trim()) { i++; continue; }

    // heading
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 5);
      const Tag = `h${level}`;
      blocks.push(<Tag key={k++} className="md-h">{renderInline(heading[2], `h${k}`)}</Tag>);
      i++;
      continue;
    }

    // horizontal rule
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) { blocks.push(<hr key={k++} />); i++; continue; }

    // table
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) { rows.push(splitRow(lines[i])); i++; }
      blocks.push(
        <div className="md-table-wrap" key={k++}>
          <table>
            <thead><tr>{head.map((c, idx) => <th key={idx}>{renderInline(c, `th${k}${idx}`)}</th>)}</tr></thead>
            <tbody>{rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci}>{renderInline(c, `td${k}${ri}${ci}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
      blocks.push(<blockquote key={k++}>{renderInline(quote.join(" "), `q${k}`)}</blockquote>);
      continue;
    }

    // lists
    const ul = /^\s*[-*+]\s+/;
    const ol = /^\s*\d+[.)]\s+/;
    if (ul.test(line) || ol.test(line)) {
      const ordered = ol.test(line);
      const re = ordered ? ol : ul;
      const items = [];
      while (i < lines.length && (re.test(lines[i]) || (lines[i].startsWith("  ") && lines[i].trim() && items.length))) {
        if (re.test(lines[i])) items.push(lines[i].replace(re, ""));
        else items[items.length - 1] += " " + lines[i].trim();
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      blocks.push(<Tag key={k++}>{items.map((item, idx) => <li key={idx}>{renderInline(item, `li${k}${idx}`)}</li>)}</Tag>);
      continue;
    }

    // paragraph
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^\s*```/.test(lines[i]) && !/^(#{1,4})\s+/.test(lines[i]) && !ul.test(lines[i]) && !ol.test(lines[i]) && !/^\s*>\s?/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    if (!para.length) { para.push(lines[i]); i++; } // safety: always make progress
    blocks.push(<p key={k++}>{renderInline(para.join("\n"), `p${k}`)}</p>);
  }

  return <div className="md">{blocks}</div>;
}
