import { Button, Container, Fieldset, Table, Text, Title } from "@mantine/core";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { getLoan } from "~/services/loan.server";
import { formatDate } from "~/utils/date";
import { formatInterestRate, formatMoney } from "~/utils/money";
import { getSession } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const loans = session.get("loans") || [];
  // note: can be very slow, one query per session-stored loan
  const loansData = await Promise.all(
    loans.map(async (loan) => {
      const loanData = await getLoan(loan);
      return loanData.loan;
    })
  );
  return json({ loans: loansData });
};

export default function LoansIndexRoute() {
  const { loans } = useLoaderData<typeof loader>();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Container>
        <Title order={3}>Your Loans</Title>
        <Fieldset mt="lg" pt="lg">
          {loans.length > 0 ? (
            <Table withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Loan Name</Table.Th>
                  <Table.Th>Original Principal</Table.Th>
                  <Table.Th>Interest Rate</Table.Th>
                  <Table.Th>Term</Table.Th>
                  <Table.Th>Started</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loans.map((loan) => (
                  <Table.Tr key={loan.publicId}>
                    <Table.Td>{loan.name}</Table.Td>
                    <Table.Td>{formatMoney(loan.amount)}</Table.Td>
                    <Table.Td>
                      {formatInterestRate(loan.interestRate)}%
                    </Table.Td>
                    <Table.Td>{loan.term} months</Table.Td>
                    <Table.Td>{formatDate(loan.startAt)}</Table.Td>
                    <Table.Td>
                      <Button
                        component={Link}
                        to={`/loans/${loan.publicId}`}
                        variant="gradient"
                        size="compact-sm"
                        gradient={{ from: "blue", to: "teal", deg: 45 }}
                      >
                        View
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text>
              No loans found. Try{" "}
              <Link to="/loans/create">creating a loan</Link>!
            </Text>
          )}
        </Fieldset>
      </Container>
    </Suspense>
  );
}
