import {describe,expect,it} from 'vitest';
import {calculate,calculateNaturalLanguage} from '../src/lib/calculator';
describe('calculator parser',()=>{
 it('respects precedence and parentheses',()=>{expect(calculate('2 + 3 * 4')).toBe(14);expect(calculate('(2 + 3) * 4')).toBe(20)});
 it('supports powers and unary signs',()=>{expect(calculate('-2^2')).toBe(-4);expect(calculate('2^3')).toBe(8)});
 it('calculates natural-language percentages',()=>{expect(calculateNaturalLanguage('Quanto representa 15% de 800?')).toBe(120)});
 it('rejects unsafe characters and division by zero',()=>{expect(()=>calculate('2 + alert(1)')).toThrow();expect(()=>calculate('5 / 0')).toThrow()});
});