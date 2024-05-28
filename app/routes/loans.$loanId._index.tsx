import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { formatMoney } from "~/utils/money";
import { Loan } from "loanjs";
import { PaymentHistoryTable } from "~/comps/payment-history-table";
import { usePaymentHistory } from "~/hooks/use-payment-history";
import { formatDate } from "~/utils/date";

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
  const data = Loan(
    loaderData.amount,
    loaderData.term,
    loaderData.interestRate * 100,
    "annuity"
  );
  const start = new Date(loaderData.startAt);
  const { payments, loan } = usePaymentHistory({
    loan: loaderData,
    payments: loaderData.payments,
  });
  return (
    <div>
      <h1>Loan Details</h1>
      <a href={`/loans/${loan.publicId}/manage`}>Manage Loan</a>
      <table border={1} cellPadding={8}>
        <tbody>
          <tr>
            <th>Loan Name</th>
            <td>{loan.name}</td>
          </tr>
          <tr>
            <th>Original Amount</th>
            <td>{formatMoney(loaderData.amount)}</td>
          </tr>
          <tr>
            <th>Current Amount</th>
            <td>{formatMoney(loan.amount)}</td>
          </tr>
          <tr>
            <th>Interest Rate</th>
            <td>{Number(loan.interestRate * 100).toFixed(3)}%</td>
          </tr>
          <tr>
            <th>Total Interest Paid</th>
            <td>{formatMoney(loan.totalInterest)}</td>
          </tr>
          <tr>
            <th>Term</th>
            <td>{loan.term} months</td>
          </tr>
          <tr>
            <th>Started</th>
            <td>{formatDate(loaderData.startAt)}</td>
          </tr>
        </tbody>
      </table>
      <PaymentHistoryTable payments={payments} />
      <h3>Amortization</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Payment Date</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Total Payment</th>
            <th>Remaining Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.installments.map((inst, i) => {
            const paymentDate = new Date(start);
            paymentDate.setUTCMonth(
              start.getUTCMonth() + i + 1,
              start.getUTCDate()
            );
            return (
              <tr key={i}>
                <td>
                  {paymentDate.toLocaleDateString("default", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </td>
                <td>{formatMoney(inst.capital)}</td>
                <td>{formatMoney(inst.interest)}</td>
                <td>{formatMoney(inst.installment)}</td>
                <td>{formatMoney(inst.remain)}</td>
              </tr>
            );
          })}
          <tr>
            <th>Total</th>
            <th>{formatMoney(data.capitalSum)}</th>
            <th>{formatMoney(data.interestSum)}</th>
            <th>{formatMoney(data.sum)}</th>
            <th>{formatMoney(0)}</th>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
