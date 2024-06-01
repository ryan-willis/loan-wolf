import {
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { commitSession, getSession } from "~/session";
import { verifyPassword } from "~/utils/security.server";
import { useState } from "react";
import { usePaymentHistory } from "~/hooks/use-payment-history";
import { PaymentHistoryTable } from "~/comps/payment-history-table";
import { AmortizationTable } from "~/comps/amortization-table";
import { useAmortize } from "~/hooks/use-amortize";
import { LoanSummary } from "~/comps/loan-summary";
import {
  Button,
  Checkbox,
  CopyButton,
  Fieldset,
  Flex,
  Grid,
  Modal,
  Space,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";

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
    const paidAt = new Date(String(form.get("payment_date"))).getTime();
    const principalOnly = form.get("principal") === "on";
    const installment = principalOnly
      ? 0
      : loan.payments.filter((p) => p.installment !== 0).length + 1;
    const pmt = await db.payment.create({
      data: {
        loanId: loan.id,
        amount,
        paidAt,
        installment,
      },
    });
    return json({ ...loan, lastAdded: pmt.id, prompt: false, message: "" });
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
    return json(
      {
        ...loan,
        prompt: true,
        message: "Invalid password",
        lastAdded: "",
      },
      {
        status: 401,
        statusText: "Unauthorized",
      }
    );
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

  const { origin } = new URL(request.url);
  return json({ ...loan, prompt, origin });
};

function LoanManageAccessForm({ message }: { message?: string }) {
  return (
    <form method="post">
      <Fieldset legend="Access Loan" pt="lg">
        <input type="hidden" name="form" value="access" />
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              type="password"
              name="password"
              label="Secret Password"
              error={message}
              required
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
      <Space h="lg" />
      <Flex justify="end">
        <Button
          type="submit"
          variant="gradient"
          gradient={{
            from: "blue",
            to: "teal",
            deg: 45,
          }}
        >
          Access Loan
        </Button>
      </Flex>
    </form>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.name || "Loan"} - Manage` }];
};
export default function LoanManageRoute() {
  const [form, setForm] = useState({ amount: 0.0, date: "", isOpen: false });
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { payments, loan } = usePaymentHistory({
    loan: loaderData,
    payments: loaderData.payments,
  });
  const { payments: amortizationPayments, total } = useAmortize({
    loan,
    payments,
  });
  if (loaderData.prompt) {
    return <LoanManageAccessForm message={actionData?.message} />;
  }

  return (
    <>
      <Flex justify="space-between" p="xs">
        <Title order={2} mb="md">
          Manage Loan
        </Title>
        <CopyButton
          value={`${loaderData.origin}/loans/${loaderData.publicId}`}
          timeout={5000}
        >
          {({ copied, copy }) => (
            <Button
              onClick={copy}
              variant="gradient"
              size="sm"
              gradient={{
                from: copied ? "blue" : "teal",
                to: copied ? "violet" : "blue",
                deg: 45,
              }}
            >
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          )}
        </CopyButton>
      </Flex>
      <LoanSummary
        loan={loan}
        totalInterest={loan.totalInterest}
        originalAmount={loaderData.amount}
      />
      <Space h="xs" />
      <Flex justify="end" p="sm">
        <Button
          onClick={() => setForm({ ...form, isOpen: true })}
          variant="gradient"
          gradient={{
            from: "blue",
            to: "teal",
            deg: 45,
          }}
        >
          Add Payment
        </Button>
      </Flex>
      <Space h="xs" />
      <PaymentHistoryTable
        payments={payments}
        options={{
          manage: true,
          header: "Payment History",
        }}
        lastAdded={actionData?.lastAdded}
      />
      <Space h="xs" />
      <AmortizationTable payments={amortizationPayments} total={total} />
      <Modal
        opened={form.isOpen}
        onClose={() => setForm({ ...form, isOpen: false })}
        title="Add Payment"
      >
        <form method="post">
          <input type="hidden" name="form" value="add-payment" />
          <Grid>
            <Grid.Col span={{ base: 6, sm: 6, md: 6 }}>
              <DateInput
                label="Payment Date"
                name="payment_date"
                required
                onChange={(v) =>
                  setForm({ ...form, date: v?.toUTCString() || "" })
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 6, md: 6 }}>
              <TextInput
                label="Amount"
                name="amount"
                type="number"
                required
                step=".01"
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                value={form.amount || ""}
                leftSection={<Text size="14">$</Text>}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12 }}>
              <Checkbox label="Principal Only" name="principal" />
            </Grid.Col>
            <Grid.Col span={{ base: 12 }}>
              <Flex gap="sm">
                <Button
                  type="submit"
                  variant="gradient"
                  gradient={{
                    from: "blue",
                    to: "teal",
                    deg: 45,
                  }}
                >
                  Add Payment
                </Button>
                <Button
                  onClick={() => setForm({ ...form, isOpen: false })}
                  variant="outline"
                >
                  Cancel
                </Button>
              </Flex>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
    </>
  );
}
