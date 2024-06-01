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
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ActionFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import ShortUniqueId from "short-unique-id";
import { commitSession, getSession } from "~/session";
import { db } from "~/utils/db.server";
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
  return (
    <>
      <h1>Create a Loan</h1>
      <form method="post">
        <Fieldset legend="Loan Details" pt="lg">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <TextInput label="Name" name="loan_name" required />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 0 }} p={0} />
            <Grid.Col span={{ base: 6, md: 4 }}>
              <TextInput
                label="Loan Amount"
                name="principal_amount"
                type="number"
                required
                step=".01"
                leftSection={<Text size="14">$</Text>}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 4 }}>
              <TextInput
                label="Interest Rate"
                name="interest_rate"
                type="number"
                required
                step=".001"
                rightSection={<Text size="14">%</Text>}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 4 }}>
              <TextInput
                label="Term"
                name="num_installments"
                type="number"
                required
                rightSection={<Text size="14">mo.</Text>}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 4 }}>
              <DateInput label="Start Date" name="start_date" required />
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 4 }}>
              <NativeSelect
                label="Payment Interval"
                name="payment_interval"
                value="5"
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
            <Grid.Col span={{ base: 6, md: 4 }}>
              <PasswordInput label="Password" name="manage_password" />
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
      </form>
    </>
  );
}
