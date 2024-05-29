import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { commitSession, getSession } from "~/session";
import { verifyPassword } from "~/utils/security.server";
import { useState } from "react";
import { usePaymentHistory } from "~/hooks/use-payment-history";
import { PaymentHistoryTable } from "~/comps/payment-history-table";
import { AmortizationTable } from "~/comps/amortization-table";
import { useAmortize } from "~/hooks/use-amortize";
import { LoanSummary } from "~/comps/loan-summary";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const _action = String(form.get("form"));

  const [loan] =
    (await db.loan.findMany({
      where: {
        OR: [{ publicId: params.loanId }, { id: params.loanId }],
      },
      include: {
        payments: true,
      },
    })) || [];

  if (!loan) {
    throw new Response("Loan not found", {
      status: 404,
      statusText: "Not Found",
    });
  }

  if (["remove-payment", "add-payment"].includes(_action)) {
    const session = await getSession(request.headers.get("Cookie"));
    const cannotManage =
      !session ||
      session.get("loans")?.length == 0 ||
      !session.get("loans")?.includes(params.loanId!);
    if (cannotManage) {
      throw new Response("Access Denied", {
        status: 403,
        statusText: "Forbidden",
      });
    }
  }

  if (_action === "remove-payment") {
    const paymentId = String(form.get("payment"));

    await db.payment.delete({
      where: {
        id: paymentId,
      },
    });
    return redirect(`/loans/${loan.publicId}/manage`, { status: 303 });
  }

  if (_action === "add-payment") {
    const amount = Number(form.get("amount"));
    const paidAt = new Date(form.get("date") + "Z").getTime();
    const principalOnly = form.get("principal") === "on";
    const installment = principalOnly
      ? 0
      : loan.payments.filter((p) => p.installment !== 0).length + 1;
    await db.payment.create({
      data: {
        loanId: loan.id,
        amount,
        paidAt,
        installment,
      },
    });
    return redirect(`/loans/${loan.publicId}/manage`, { status: 303 });
  }
  // } else if (_action === "access") {
  const managePassword = String(form.get("password"));
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
  // }
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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
      payments: {
        orderBy: {
          paidAt: "asc",
        },
      },
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
      <input type="hidden" name="form" value="access" />
      <label>
        Secret Password:
        <input type="password" name="password" />
      </label>
      <button type="submit">Access Loan</button>
    </form>
  );
}

export default function LoanManageRoute() {
  const [form, setForm] = useState({ amount: 0.0, date: "", isOpen: false });
  const loaderData = useLoaderData<typeof loader>();
  const { payments, loan } = usePaymentHistory({
    loan: loaderData,
    payments: loaderData.payments,
  });
  const { payments: amortizationPayments, total } = useAmortize({
    loan,
    payments,
  });
  if (loaderData.prompt) {
    return <LoanManageAccessForm />;
  }
  return (
    <div>
      <h2>Manage Loan</h2>
      <LoanSummary
        loan={loan}
        totalInterest={loan.totalInterest}
        originalAmount={loaderData.amount}
      />
      <h3>Payments</h3>
      {!form.isOpen ? (
        <button onClick={() => setForm({ ...form, isOpen: true })}>
          Add Payment
        </button>
      ) : (
        <form method="post">
          <input type="hidden" name="form" value="add-payment" />
          <label>
            Payment Date:
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label>
            Amount:
            <input
              type="number"
              name="amount"
              step=".01"
              value={form.amount || ""}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
              onFocus={(e) => e.target.select()}
            />
          </label>
          <label>
            Principal Only
            <input type="checkbox" name="principal" />
          </label>
          <button type="submit">Create Payment</button>
        </form>
      )}
      <PaymentHistoryTable
        payments={payments}
        options={{ header: null, manage: true }}
      />
      <AmortizationTable payments={amortizationPayments} total={total} />
    </div>
  );
}
