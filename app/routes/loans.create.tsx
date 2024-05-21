import { ActionFunctionArgs, redirect } from "@remix-run/node";
import ShortUniqueId from "short-unique-id";
import { db } from "~/utils/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const name = String(form.get("loan_name"));
  const amount = Number(form.get("principal_amount"));
  const interestRate = Number(form.get("interest_rate")) / 100;
  const term = Number(form.get("num_installments"));
  const startAt = new Date(form.get("start_date") + "Z").getTime();
  const paymentInterval = Number(form.get("payment_interval"));
  const interestCompounds = paymentInterval;

  const data = {
    name,
    amount,
    interestRate,
    term,
    startAt,
    paymentInterval,
    interestCompounds,
    status: "active",
    publicId: new ShortUniqueId({ length: 10 }).randomUUID(),
  };

  const loan = await db.loan.create({ data });
  return redirect(`/loans/${loan.publicId}`);
}

export default function CreateLoanRoute() {
  return (
    <div>
      <h1>Create a Loan</h1>
      <form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "320px",
          gap: "1rem",
        }}
      >
        <label>
          Name:
          <input type="text" name="loan_name" />
        </label>
        <label>
          Loan Amount:
          <input type="number" name="principal_amount" />
        </label>
        <label>
          Interest Rate:
          <input type="number" name="interest_rate" step=".001" />
        </label>
        <label>
          Term:
          <input type="number" name="num_installments" />
        </label>
        <label>
          Start Date:
          <input type="date" name="start_date" />
        </label>
        <label>
          Payment Interval:
          <select name="payment_interval">
            <option value="1">Daily</option>
            <option value="2">Weekly</option>
            <option value="3">Bi-weekly</option>
            <option value="4">Semi-monthly</option>
            <option value="5">Monthly</option>
            <option value="6">Quarterly</option>
            <option value="7">Semi-annually</option>
            <option value="8">Annually</option>
          </select>
        </label>
        <button type="submit">Create Loan</button>
      </form>
    </div>
  );
}
