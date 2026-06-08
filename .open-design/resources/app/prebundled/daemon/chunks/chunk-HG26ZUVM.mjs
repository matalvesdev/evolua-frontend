import { createRequire as __odCreateRequire } from "node:module"; const require = __odCreateRequire(import.meta.url);

// ../daemon/dist/plugins/until.js
var SIGNAL_KINDS = {
  "critique.score": "number",
  "iterations": "number",
  "user.confirmed": "boolean",
  "preview.ok": "boolean",
  "build.passing": "boolean",
  "tests.passing": "boolean"
};
var UntilSyntaxError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "UntilSyntaxError";
  }
};
function parseUntil(source) {
  const trimmed = source.trim();
  if (trimmed.length === 0) {
    throw new UntilSyntaxError("empty until expression");
  }
  const ors = splitTopLevel(trimmed, "||");
  const any = [];
  for (const orTerm of ors) {
    const ands = splitTopLevel(orTerm, "&&");
    const inner = [];
    for (const andTerm of ands) {
      inner.push(parseComparison(andTerm.trim()));
    }
    if (inner.length === 0) {
      throw new UntilSyntaxError(`empty conjunction in "${source}"`);
    }
    any.push(inner);
  }
  if (any.length === 0) {
    throw new UntilSyntaxError(`no terms in "${source}"`);
  }
  return { any };
}
function splitTopLevel(input, sep) {
  const parts = [];
  let cursor = 0;
  let depth = 0;
  for (let i = 0; i < input.length - 1; i += 1) {
    const ch = input[i];
    if (ch === "(")
      depth += 1;
    else if (ch === ")")
      depth -= 1;
    else if (depth === 0 && ch === sep[0] && input[i + 1] === sep[1]) {
      parts.push(input.slice(cursor, i));
      cursor = i + 2;
      i += 1;
    }
  }
  parts.push(input.slice(cursor));
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}
function parseComparison(raw) {
  const expression = stripOuterParens(raw).trim();
  const opMatch = expression.match(/(==|!=|>=|<=|>|<)/);
  if (!opMatch || opMatch.index === void 0) {
    throw new UntilSyntaxError(`expected comparison operator in "${raw}"`);
  }
  const op = opMatch[0];
  const lhs = expression.slice(0, opMatch.index).trim();
  const rhs = expression.slice(opMatch.index + op.length).trim();
  if (!(lhs in SIGNAL_KINDS)) {
    throw new UntilSyntaxError(`unknown signal "${lhs}" \u2014 supported: ${Object.keys(SIGNAL_KINDS).join(", ")}`);
  }
  const signal = lhs;
  const kind = SIGNAL_KINDS[signal];
  let value;
  if (kind === "boolean") {
    if (rhs !== "true" && rhs !== "false") {
      throw new UntilSyntaxError(`signal "${signal}" expects true/false, got "${rhs}"`);
    }
    if (op !== "==" && op !== "!=") {
      throw new UntilSyntaxError(`boolean signal "${signal}" only supports == and !=, got "${op}"`);
    }
    value = rhs === "true";
  } else {
    const parsed = Number(rhs);
    if (!Number.isFinite(parsed)) {
      throw new UntilSyntaxError(`signal "${signal}" expects a number, got "${rhs}"`);
    }
    value = parsed;
  }
  return { signal, op, value };
}
function stripOuterParens(input) {
  let s = input;
  while (s.startsWith("(") && s.endsWith(")")) {
    let depth = 0;
    let isOuter = true;
    for (let i = 0; i < s.length - 1; i += 1) {
      const ch = s[i];
      if (ch === "(")
        depth += 1;
      else if (ch === ")")
        depth -= 1;
      if (depth === 0 && i < s.length - 1) {
        isOuter = false;
        break;
      }
    }
    if (!isOuter)
      return s;
    s = s.slice(1, -1).trim();
  }
  return s;
}
function evaluateUntil(expression, signals) {
  for (const conjunction of expression.any) {
    let allHold = true;
    for (const term of conjunction) {
      if (!evaluateTerm(term, signals)) {
        allHold = false;
        break;
      }
    }
    if (allHold)
      return { satisfied: true, matched: conjunction };
  }
  return { satisfied: false, matched: [] };
}
function evaluateTerm(term, signals) {
  const left = signals[term.signal];
  if (left === void 0)
    return false;
  if (typeof term.value === "boolean") {
    if (typeof left !== "boolean")
      return false;
    return term.op === "==" ? left === term.value : left !== term.value;
  }
  if (typeof left !== "number")
    return false;
  const right = term.value;
  switch (term.op) {
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case "<":
      return left < right;
  }
}
function isParseableUntil(source) {
  try {
    parseUntil(source);
    return true;
  } catch {
    return false;
  }
}

export {
  parseUntil,
  evaluateUntil,
  isParseableUntil
};
