import { ILoan, IPayment } from "~/types";
import { getPrincipalInterestSpread } from "~/utils/money";

export function usePaymentHistory({
  loan: originalLoan,
  payments: originalPayments,
}: {
  loan: ILoan;
  payments: IPayment[];
}) {
  const loan: ILoan & { totalInterest: number; originalAmount: number } = {
    ...originalLoan,
    originalAmount: originalLoan.amount,
    totalInterest: 0,
  };
  const start = new Date(loan.startAt);
  const payments = originalPayments
    .map((payment) => {
      const isPrincipalOnly = payment.installment === 0;
      const paymentDue = new Date(start);
      if (!isPrincipalOnly)
        paymentDue.setUTCMonth(
          start.getUTCMonth() + (payment.installment || 0),
          start.getUTCDate()
        );
      const { principal, interest } = isPrincipalOnly
        ? {
            principal: payment.amount,
            interest: 0,
          }
        : getPrincipalInterestSpread(loan, payment);
      loan.amount -= principal;
      loan.totalInterest += interest;
      return {
        date: payment.paidAt,
        dueDate: isPrincipalOnly ? "N/A" : paymentDue,
        amount: payment.amount,
        principal: principal,
        interest: interest,
        remaining: loan.amount,
        id: payment.id,
      };
    })
    .reverse();

  return {
    loan,
    payments,
  };
}
