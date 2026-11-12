type Token = { type: 'number' | 'operator' | 'left' | 'right'; value: string };
function tokenize(input: string): Token[] {
  const result: Token[] = []; let index = 0;
  while (index < input.length) {
    const rest = input.slice(index); const space = rest.match(/^\s+/);
    if (space) { index += space[0].length; continue; }
    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)/);
    if (number) { result.push({ type: 'number', value: number[0] }); index += number[0].length; continue; }
    const char = input[index];
    if ('+-*/^'.includes(char)) result.push({ type: 'operator', value: char });
    else if (char === '(') result.push({ type: 'left', value: char });
    else if (char === ')') result.push({ type: 'right', value: char });
    else throw new Error('Expressão contém caracteres não permitidos.');
    index++;
  }
  return result;
}
export function calculate(expression: string): number {
  const tokens = tokenize(expression); let cursor = 0;
  const peek = () => tokens[cursor]; const take = () => tokens[cursor++];
  function primary(): number {
    const token = take(); if (!token) throw new Error('Expressão incompleta.');
    if (token.type === 'number') return Number(token.value);
    if (token.type === 'left') { const value = addition(); if (take()?.type !== 'right') throw new Error('Parênteses não correspondentes.'); return value; }
    if (token.type === 'operator' && (token.value === '+' || token.value === '-')) { const value = primary(); return token.value === '-' ? -value : value; }
    throw new Error('Número esperado.');
  }
  function power(): number { const left = primary(); if (peek()?.value === '^') { take(); return left ** power(); } return left; }
  function multiply(): number {
    let value = power();
    while (peek()?.value === '*' || peek()?.value === '/') {
      const op = take().value; const right = power();
      if (op === '/' && right === 0) throw new Error('Não é possível dividir por zero.');
      value = op === '*' ? value * right : value / right;
    }
    return value;
  }
  function addition(): number {
    let value = multiply();
    while (peek()?.value === '+' || peek()?.value === '-') { const op = take().value; const right = multiply(); value = op === '+' ? value + right : value - right; }
    return value;
  }
  if (!tokens.length) throw new Error('Informe uma expressão matemática.');
  const result = addition();
  if (cursor !== tokens.length || !Number.isFinite(result)) throw new Error('Expressão matemática inválida.');
  return Number(result.toPrecision(12));
}
export function calculateNaturalLanguage(input: string): number {
  const percentage = input.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:de|do|da)\s*(\d+(?:[.,]\d+)?)/i);
  if (percentage) return Number(percentage[1].replace(',', '.')) * Number(percentage[2].replace(',', '.')) / 100;
  const cleaned = input.toLowerCase().replace(/quanto (?:é|e)|calcule|calculadora|jarvis|por favor|qual o resultado de/gi, '').replace(/,/g, '.').replace(/[?=]/g, '').trim();
  return calculate(cleaned);
}