import { ILoan, IPayment } from "~/types";

const MoneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function formatMoney(amount: number) {
  return MoneyFormatter.format(amount);
}

export function getPrincipalInterestSpread(loan: ILoan, payment: IPayment) {
  const multiplier = loan.interestRate / 12;
  const interest = loan.currentAmount * multiplier;
  const principal = payment.amount - interest;
  return { principal, interest };
}

export function getMonthlyPayment(loan: ILoan) {
  const multiplier = loan.interestRate / 12;
  const numerator = loan.originalAmount * multiplier;
  const denominator = 1 - Math.pow(1 + multiplier, -loan.term);
  return numerator / denominator;
}
