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
