export type TokenType = "i" | "k" | "s" | "t" | "a" | "f" | "c" | "p";
export type Token = readonly [TokenType, string];

export const tokenColor: Record<TokenType, string> = {
  i: "",
  k: "text-(--syn-keyword)",
  s: "text-(--syn-string)",
  t: "text-(--syn-tag)",
  a: "text-(--syn-attr)",
  f: "text-(--syn-fn)",
  c: "text-(--syn-comment) italic",
  p: "text-foreground/85",
};

const KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "default",
  "function",
  "return",
  "const",
  "let",
  "var",
  "type",
  "interface",
  "class",
  "public",
  "private",
  "readonly",
  "static",
  "async",
  "await",
  "new",
  "if",
  "else",
  "throw",
  "using",
  "namespace",
  "record",
  "string",
  "number",
  "boolean",
  "void",
  "this",
  "true",
  "false",
  "null",
  "undefined",
  "constructor",
  "extends",
  "implements",
  "of",
  "in",
  "for",
  "while",
  "typeof",
  "as",
  "package",
  "final",
]);

const TOKEN_RE =
  /\/\/.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|@[A-Za-z_]\w*|\d+(?:\.\d+)?|[A-Za-z_$][\w$]*|\s+|./g;

function highlightCodeLine(line: string, lang: string): Token[] {
  const tokens: Token[] = [];
  for (const match of line.matchAll(TOKEN_RE)) {
    const text = match[0];
    const end = (match.index ?? 0) + text.length;
    const next = line[end];
    const rest = line.slice(end).trimStart();
    let type: TokenType = "p";

    if (text.startsWith("//")) type = "c";
    else if (lang === "yml" && next === ":") type = "a";
    else if (/^["'`]/.test(text))
      type = lang === "json" && rest.startsWith(":") ? "a" : "s";
    else if (text.startsWith("@")) type = "f";
    else if (/^\d/.test(text)) type = "a";
    else if (/^[A-Za-z_$]/.test(text)) {
      if (KEYWORDS.has(text)) type = "k";
      else if (next === "(") type = "f";
      else if (next === "=" && /["{]/.test(line[end + 1] ?? "")) type = "a";
      else if (/^[A-Z]/.test(text)) type = "t";
    }

    const prev = tokens.at(-1);
    if (prev && prev[0] === type && type === "p") {
      tokens[tokens.length - 1] = ["p", prev[1] + text];
    } else {
      tokens.push([type, text]);
    }
  }
  return tokens;
}

function highlightMarkdownLine(line: string): Token[] {
  if (line.startsWith("#")) return [["k", line]];
  return line
    .split(/(`[^`]*`)/)
    .filter(Boolean)
    .map((part): Token => (part.startsWith("`") ? ["s", part] : ["p", part]));
}

export function highlight(source: string, lang: string): Token[][] {
  return source.split("\n").map((line) => {
    const indent = /^\s*/.exec(line)?.[0] ?? "";
    const body = line.slice(indent.length);
    const tokens =
      lang === "md"
        ? highlightMarkdownLine(body)
        : highlightCodeLine(body, lang);
    return indent ? [["i", indent] as Token, ...tokens] : tokens;
  });
}

export const typedLength = (line: Token[]) =>
  line.reduce((n, [type, text]) => (type === "i" ? n : n + text.length), 0);
