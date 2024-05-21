import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { formatMoney } from "~/utils/money";
import { Loan } from "loanjs";
import { commitSession, getSession } from "~/session";
import { verifyPassword } from "~/utils/security.server";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const managePassword = String(form.get("password"));

  const [loan] =
    (await db.loan.findMany({
      where: {
        OR: [{ publicId: params.loanId }, { id: params.loanId }],
      },
    })) || [];

  if (!loan) {
    throw new Response("Loan not found", {
      status: 404,
      statusText: "Not Found",
    });
  }
  if (loan.managePassword === "denied" || loan.managePassword === "") {
    throw new Response("Access Denied", {
      status: 403,
      statusText: "Forbidden",
    });
  }
  const passwordMatch = await verifyPassword(
    loan.managePassword,
    managePassword
  );
  if (!passwordMatch) {
    return redirect(`/loans/${loan.publicId}/manage`, { status: 303 });
  }
  const session = await getSession(request.headers.get("Cookie"));
  const loans = new Set(session.get("loans") || []);
  loans.add(loan.publicId);
  session.set("loans", [...loans]);
  return redirect(`/loans/${loan.publicId}/manage`, {
    status: 303,
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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
  const loan = loans[0];

  const session = await getSession(request.headers.get("Cookie"));
  const prompt =
    !session ||
    session.get("loans")?.length == 0 ||
    !session.get("loans")?.includes(params.loanId!);

  return json({ ...loan, prompt });
};

function LoanManageAccessForm() {
  return (
    <form method="post">
      <label>
        Secret Password:
        <input type="password" name="password" />
      </label>
      <button type="submit">Access Loan</button>
    </form>
  );
}

export default function LoanManageRoute() {
  const loan = useLoaderData<typeof loader>();
  if (loan.prompt) {
    return <LoanManageAccessForm />;
  }
  const data = Loan(loan.amount, loan.term, loan.interestRate * 100, "annuity");
  const start = new Date(loan.startAt);
  const dt = start.toLocaleString("default", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <div>
      <h1>Manage Loan</h1>
      <table border={1} cellPadding={8}>
        <tbody>
          <tr>
            <th>Loan Name</th>
            <td>{loan.name}</td>
          </tr>
          <tr>
            <th>Amount</th>
            <td>{formatMoney(loan.amount)}</td>
          </tr>
          <tr>
            <th>Interest Rate</th>
            <td>{Number(loan.interestRate * 100).toFixed(3)}%</td>
          </tr>
          <tr>
            <th>Term</th>
            <td>{loan.term} months</td>
          </tr>
          <tr>
            <th>Started</th>
            <td>{dt}</td>
          </tr>
        </tbody>
      </table>
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
