import { getMonthlyPayment, getPrincipalInterestSpread } from "~/utils/money";

interface AmortizationPayment {
  date: Date;
  principal: number;
  interest: number;
  total: number;
  remaining: number;
}

export function useAmortize({
  loan,
  payments: originalPayments,
}: {
  loan: {
    startAt: number;
    term: number;
    amount: number;
    interestRate: number;
    totalInterest: number;
    originalAmount: number;
  };
  payments: { interest: number }[];
}) {
  const installmentsMade = originalPayments.filter(
    (p) => p.interest > 0
  ).length;
  const length = loan.term - installmentsMade;
  const cursor = {
    amount: loan.amount,
    interestRate: loan.interestRate,
    totalInterest: loan.totalInterest,
  };
  const amount = getMonthlyPayment({
    amount: loan.originalAmount,
    term: loan.term,
    interestRate: loan.interestRate,
  });

  const payments = Array.from({ length })
    .map((_, i) => {
      const paymentDate = new Date(loan.startAt);
      paymentDate.setUTCMonth(
        paymentDate.getUTCMonth() + installmentsMade + i + 1,
        paymentDate.getUTCDate()
      );
      if (cursor.amount === 0) return null;
      const amounts = getPrincipalInterestSpread(cursor, { amount });
      if (cursor.amount < amounts.principal) amounts.principal = cursor.amount;
      cursor.amount -= amounts.principal;
      cursor.totalInterest += amounts.interest;
      return {
        date: paymentDate,
        principal: amounts.principal,
        interest: amounts.interest,
        total: amounts.principal + amounts.interest,
        remaining: cursor.amount,
      };
    })
    .filter((p) => p !== null) as AmortizationPayment[];
  return {
    payments,
    total: {
      principal: loan.originalAmount,
      interest: cursor.totalInterest,
      total: loan.originalAmount + cursor.totalInterest,
      remaining: 0,
    },
  };
}
