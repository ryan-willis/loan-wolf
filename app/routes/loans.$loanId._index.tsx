import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { PaymentHistoryTable } from "~/comps/payment-history-table";
import { usePaymentHistory } from "~/hooks/use-payment-history";
import { AmortizationTable } from "~/comps/amortization-table";
import { useAmortize } from "~/hooks/use-amortize";
import { LoanSummary } from "~/comps/loan-summary";
import { Space } from "@mantine/core";
import { getLoan } from "~/services/loan.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { loan } = await getLoan(params.loanId!);
  if (!loan) {
    throw new Response("Loan not found", {
      status: 404,
      statusText: "Not Found",
    });
  }
  return json(loan);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.name || "Loan"} - Loan Wolf` }];
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
    <>
      <LoanSummary
        loan={loan}
        totalInterest={loan.totalInterest}
        originalAmount={loaderData.amount}
        showManage
      />
      <Space h="xs" />
      <PaymentHistoryTable payments={payments} />
      <Space h="xs" />
      <AmortizationTable payments={amortizationPayments} total={total} />
    </>
  );
}
