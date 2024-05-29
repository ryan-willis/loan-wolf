import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { PaymentHistoryTable } from "~/comps/payment-history-table";
import { usePaymentHistory } from "~/hooks/use-payment-history";
import { AmortizationTable } from "~/comps/amortization-table";
import { useAmortize } from "~/hooks/use-amortize";
import { LoanSummary } from "~/comps/loan-summary";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const loans = await db.loan.findMany({
    where: {
      OR: [{ publicId: params.loanId }, { id: params.loanId }],
    },
    select: {
      publicId: true,
      name: true,
      amount: true,
      interestRate: true,
      term: true,
      startAt: true,
      payments: true,
    },
  });
  if (loans.length == 0) {
    throw new Response("Loan not found", {
      status: 404,
      statusText: "Not Found",
    });
  }
  return json({ ...loans[0] });
};

export default function LoanRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const { payments, loan } = usePaymentHistory({
    loan: loaderData,
    payments: loaderData.payments,
  });
  const { payments: amortizationPayments, total } = useAmortize({
    loan,
    payments,
  });
  return (
    <div>
      <h2>Loan Details</h2>
      <LoanSummary
        loan={loan}
        totalInterest={loan.totalInterest}
        originalAmount={loaderData.amount}
        showManage
      />
      <PaymentHistoryTable payments={payments} />
      <AmortizationTable payments={amortizationPayments} total={total} />
    </div>
  );
}
