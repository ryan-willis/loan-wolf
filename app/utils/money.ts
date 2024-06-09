import { ILoan, IPayment } from "~/types";

const MoneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function formatMoney(amount: number) {
  return MoneyFormatter.format(amount);
}

export function getPrincipalInterestSpread(
  loan: Pick<ILoan, "amount" | "interestRate">,
  payment: Pick<IPayment, "amount">
) {
  const multiplier = loan.interestRate / 12;
  const interest = Math.round(loan.amount * multiplier * 100) / 100;
  const principal = payment.amount - interest;
  return { principal, interest };
}

export function getMonthlyPayment(
  loan: Pick<ILoan, "amount" | "interestRate" | "term">
) {
  const multiplier = loan.interestRate / 12;
  const numerator = loan.amount * multiplier;
  const denominator = 1 - Math.pow(1 + multiplier, -loan.term); // ain't math fun?
  return Math.round((100 * numerator) / denominator) / 100;
}

export function getInterestRate({
  amount,
  term,
  monthly,
}: Pick<ILoan, "amount" | "term"> & { monthly: number }) {
  const eq = (r: number) =>
    monthly - (r * amount) / (1 - Math.pow(1 + r, -term));

  const solve = (lb: number, ub: number, t: number) => {
    let r = (lb + ub) / 2;
    while (ub - lb > t) {
      if (eq(r) * eq(lb) < 0) {
        ub = r;
      } else {
        lb = r;
      }
      r = (lb + ub) / 2;
    }
    return r;
  };

  return Math.round(1000 * (solve(0.0001, 1, 0.0000001) * 12 * 100)) / 1000;
}
