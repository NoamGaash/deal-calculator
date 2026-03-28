import type { PropertyType } from '../types';

interface Bracket {
  upTo: number;
  rate: number;
}

// Israeli purchase tax brackets — updated 2024
// Source: רשות המיסים, updated annually on Jan 16
const FIRST_HOME_BRACKETS: Bracket[] = [
  { upTo: 1_978_745, rate: 0.00 },
  { upTo: 2_347_210, rate: 0.035 },
  { upTo: 6_055_070, rate: 0.05 },
  { upTo: 20_183_565, rate: 0.08 },
  { upTo: Infinity,  rate: 0.10 },
];

const ADDITIONAL_BRACKETS: Bracket[] = [
  { upTo: 5_872_725, rate: 0.08 },
  { upTo: Infinity,  rate: 0.10 },
];

export function calcPurchaseTax(price: number, type: PropertyType): number {
  const brackets = type === 'first' ? FIRST_HOME_BRACKETS : ADDITIONAL_BRACKETS;
  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    if (price <= prev) break;
    const taxable = Math.min(price, bracket.upTo) - prev;
    tax += taxable * bracket.rate;
    prev = bracket.upTo;
  }
  return Math.round(tax);
}
