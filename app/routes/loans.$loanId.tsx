import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { formatMoney } from "~/utils/money";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const loans = await db.loan.findMany({
    where: {
      OR: [{ publicId: params.loanId }, { id: params.loanId }],
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
  const loan = useLoaderData<typeof loader>();
  const start = new Date(loan.startAt);
  const yr = start.getUTCFullYear();
  const mo = start.toLocaleString("default", {
    month: "long",
    timeZone: "UTC",
  });
  const da = start.toLocaleString("default", {
    day: "numeric",
    timeZone: "UTC",
  });
  return (
    <div>
      <h1>{loan.name}</h1>
      <p>Loan ID: {loan.id}</p>
      <p>Amount: {formatMoney(loan.amount)}</p>
      <p>Interest Rate: {Number(loan.interestRate * 100).toFixed(3)}%</p>
      <p>Term: {loan.term}</p>
      <p>
        Started: {mo} {da}, {yr}
      </p>
    </div>
  );
}
