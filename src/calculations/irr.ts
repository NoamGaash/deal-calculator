function npv(cashflows: number[], monthlyRate: number): number {
  return cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + monthlyRate, t), 0);
}

function dnpv(cashflows: number[], monthlyRate: number): number {
  return cashflows.reduce(
    (acc, cf, t) => acc - (t * cf) / Math.pow(1 + monthlyRate, t + 1),
    0
  );
}

export function calcIRR(cashflows: number[]): number {
  let rate = 0.005; // initial guess: 0.5% monthly
  for (let i = 0; i < 1000; i++) {
    const n = npv(cashflows, rate);
    const dn = dnpv(cashflows, rate);
    if (Math.abs(dn) < 1e-12) break;
    const next = rate - n / dn;
    if (Math.abs(next - rate) < 1e-9) {
      return Math.pow(1 + next, 12) - 1; // annualize
    }
    rate = next;
    if (rate < -0.9) rate = 0.001; // guard against divergence
  }
  return NaN;
}
