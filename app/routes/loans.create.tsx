import {
  Button,
  Fieldset,
  Flex,
  Grid,
  NativeSelect,
  PasswordInput,
  Space,
  TextInput,
  Text,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ActionFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useState } from "react";
import ShortUniqueId from "short-unique-id";
import { AmortizationTable } from "~/comps/amortization-table";
import { useAmortize } from "~/hooks/use-amortize";
import { commitSession, getSession } from "~/session";
import { formatDate } from "~/utils/date";
import { db } from "~/utils/db.server";
import { formatMoney, getMonthlyPayment } from "~/utils/money";
import { hashPassword } from "~/utils/security.server";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const name = String(form.get("loan_name"));
  const amount = Number(form.get("principal_amount"));
  const interestRate = Number(form.get("interest_rate")) / 100;
  const term = Number(form.get("num_installments"));
  const startAt = new Date(String(form.get("start_date"))).getTime();
  const paymentInterval = Number(form.get("payment_interval"));
  const managePasswordRaw = String(form.get("manage_password"));
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
    managePassword: await hashPassword(managePasswordRaw),
  };

  const loan = await db.loan.create({ data });

  const session = await getSession(request.headers.get("Cookie"));
  const loans = new Set(session.get("loans") || []);
  loans.add(loan.publicId);
  session.set("loans", [...loans]);
  return redirect(`/loans/${loan.publicId}`, {
    status: 303,
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
export const meta: MetaFunction = () => {
  return [{ title: "Create a Loan" }];
};
export default function CreateLoanRoute() {
  const start_date = new Date();
  start_date.setHours(0, 0, 0, 0);

  const [loan, setLoan] = useState({
    loan_name: "",
    principal_amount: "",
    interest_rate: "",
    num_installments: "",
    start_date,
    payment_interval: "5",
    manage_password: "",
  });

  const monthly = getMonthlyPayment({
    amount: Number(loan.principal_amount),
    interestRate: Number(loan.interest_rate) / 100,
    term: Number(loan.num_installments),
  });

  const invalid =
    Number(loan.principal_amount || 0) <= 0 ||
    isNaN(monthly) ||
    !isFinite(monthly);

  const amorizationTable = useAmortize({
    loan: {
      startAt: loan.start_date.getTime(),
      amount: Number(loan.principal_amount),
      interestRate: Number(loan.interest_rate) / 100,
      term: Number(loan.num_installments),
      totalInterest: 0,
      originalAmount: Number(loan.principal_amount),
    },
    payments: [],
  });

  const firstPaymentDate = new Date(loan.start_date).setMonth(
    loan.start_date.getMonth() + 1
  );

  return (
    <>
      <h1>Create a Loan</h1>
      <form method="post">
        <Fieldset legend="Loan Details" pt="lg">
          <Grid>
            <Grid.Col span={{ base: 12, xs: 6, sm: 4 }}>
              <TextInput label="Name" name="loan_name" required />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6, sm: 0 }} p={0} />
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <TextInput
                label="Loan Amount"
                name="principal_amount"
                type="number"
                value={loan.principal_amount}
                onChange={(event) =>
                  setLoan({
                    ...loan,
                    principal_amount: event.currentTarget.value,
                  })
                }
                required
                step=".01"
                leftSection={<Text size="14">$</Text>}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <TextInput
                label="Interest Rate"
                name="interest_rate"
                type="number"
                value={loan.interest_rate}
                onChange={(event) =>
                  setLoan({
                    ...loan,
                    interest_rate: event.currentTarget.value,
                  })
                }
                required
                step=".001"
                rightSection={<Text size="14">%</Text>}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <TextInput
                label="Term"
                name="num_installments"
                type="number"
                onChange={(event) =>
                  setLoan({
                    ...loan,
                    num_installments: event.currentTarget.value,
                  })
                }
                required
                rightSection={<Text size="14">mo.</Text>}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <DateInput
                label="Start Date"
                name="start_date"
                value={loan.start_date}
                onChange={(value) =>
                  setLoan({
                    ...loan,
                    start_date: value || new Date(),
                  })
                }
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <NativeSelect
                label="Payment Interval"
                name="payment_interval"
                value={loan.payment_interval}
                onChange={(event) =>
                  setLoan({
                    ...loan,
                    payment_interval: event.currentTarget.value,
                  })
                }
                disabled
                data={[
                  { value: "1", label: "Daily" },
                  { value: "2", label: "Weekly" },
                  { value: "3", label: "Bi-weekly" },
                  { value: "4", label: "Semi-monthly" },
                  { value: "5", label: "Monthly" },
                  { value: "6", label: "Quarterly" },
                  { value: "7", label: "Semi-annually" },
                  { value: "8", label: "Annually" },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <PasswordInput
                label="Password"
                name="manage_password"
                value={loan.manage_password}
                onChange={(event) =>
                  setLoan({
                    ...loan,
                    manage_password: event.currentTarget.value,
                  })
                }
              />
            </Grid.Col>
          </Grid>
        </Fieldset>
        {!invalid && (
          <>
            <Space h="lg" />
            <Fieldset p="md">
              <Grid>
                <Grid.Col span={{ base: 12, xs: 6 }}>
                  <Flex justify="space-between">
                    <Title order={5}>Monthly Payment</Title>
                    <Text>{formatMoney(monthly)}</Text>
                  </Flex>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6 }}>
                  <Flex justify="space-between">
                    <Title order={5}>Total Interest</Title>
                    <Text>{formatMoney(amorizationTable.total.interest)}</Text>
                  </Flex>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6 }}>
                  <Flex justify="space-between">
                    <Title order={5}>First Payment Date</Title>
                    <Text>{formatDate(firstPaymentDate)}</Text>
                  </Flex>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6 }}>
                  <Flex justify="space-between">
                    <Title order={5}>Total Payment</Title>
                    <Text>{formatMoney(amorizationTable.total.total)}</Text>
                  </Flex>
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
                Create Loan
              </Button>
            </Flex>
            <Space h="lg" />
            <AmortizationTable {...amorizationTable} />
          </>
        )}
      </form>
    </>
  );
}
