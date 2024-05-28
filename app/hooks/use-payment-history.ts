import { ILoan, IPayment } from "~/types";
import { formatDate } from "~/utils/date";
import { formatMoney, getPrincipalInterestSpread } from "~/utils/money";

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
        date: formatDate(payment.paidAt),
        dueDate: isPrincipalOnly ? "N/A" : formatDate(paymentDue),
        amount: formatMoney(payment.amount),
        principal: formatMoney(principal),
        interest: formatMoney(interest),
        remaining: formatMoney(loan.amount),
        id: payment.id,
      };
    })
    .reverse();

  return {
    loan,
    payments,
  };
}
