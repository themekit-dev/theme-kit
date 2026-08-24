const EXPRESSION_PATTERN = /[+\-*/]/;

export function isExpression(value: string): boolean {
  if (!EXPRESSION_PATTERN.test(value)) return false;
  if (/^(contrast|auto)\s*\(/.test(value)) return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  const stripped = trimmed.replace(/[a-z%]+$/i, "").trim();
  if (!stripped) return false;

  return /^[\d\s+\-*/().]+$/.test(stripped);
}

type Token =
  | { type: "number"; value: number }
  | { type: "op"; value: string }
  | { type: "paren"; value: "(" | ")" };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i]!;
    if (ch === " ") { i++; continue; }
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      i++;
      continue;
    }
    if ("+-*/".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (/\d/.test(ch) || (ch === "." && i + 1 < input.length && /\d/.test(input[i + 1]!))) {
      let num = "";
      while (i < input.length && /[\d.eE]/.test(input[i]!)) {
        num += input[i]!;
        i++;
      }
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }
    throw new Error(`Unexpected character in expression: "${ch}"`);
  }
  return tokens;
}

function parseExpression(tokens: Token[]): number {
  let result = parseTerm(tokens);
  while (tokens.length > 0 && tokens[0]!.type === "op" && (tokens[0]!.value === "+" || tokens[0]!.value === "-")) {
    const op = tokens.shift()!.value;
    const right = parseTerm(tokens);
    result = op === "+" ? result + right : result - right;
  }
  return result;
}

function parseTerm(tokens: Token[]): number {
  let result = parseFactor(tokens);
  while (tokens.length > 0 && tokens[0]!.type === "op" && (tokens[0]!.value === "*" || tokens[0]!.value === "/")) {
    const op = tokens.shift()!.value;
    const right = parseFactor(tokens);
    result = op === "*" ? result * right : result / right;
  }
  return result;
}

function parseFactor(tokens: Token[]): number {
  if (tokens.length === 0) throw new Error("Unexpected end of expression");
  const token = tokens.shift()!;
  if (token.type === "number") return token.value;
  if (token.type === "paren" && token.value === "(") {
    const result = parseExpression(tokens);
    if (tokens.length === 0 || tokens[0]!.type !== "paren" || tokens[0]!.value !== ")") {
      throw new Error("Missing closing parenthesis");
    }
    tokens.shift();
    return result;
  }
  throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
}

function extractUnit(expr: string): { numericPart: string; unit: string } {
  const match = expr.match(/^([\d\s+\-*/().]+)([a-z%]+)$/i);
  if (match) {
    const beforeUnit = match[1]!.trim();
    if (/[\d)]$/.test(beforeUnit)) {
      return { numericPart: beforeUnit, unit: match[2]! };
    }
  }
  return { numericPart: expr, unit: "" };
}

export function evaluateExpression(expr: string): string {
  try {
    const trimmed = expr.trim();
    const { numericPart, unit } = extractUnit(trimmed);
    if (!numericPart) return expr;

    const tokens = tokenize(numericPart);
    if (tokens.length === 0) return expr;

    const result = parseExpression(tokens);
    if (tokens.length > 0) {
      return expr;
    }
    if (!isFinite(result)) {
      return expr;
    }
    return Number.isInteger(result) ? String(result) + unit : result.toFixed(2) + unit;
  } catch {
    return expr;
  }
}
