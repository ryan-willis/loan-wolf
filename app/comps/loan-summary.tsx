import { Button, Fieldset, Flex, Table, Title } from "@mantine/core";
import { ILoan } from "~/types";
import { formatDate } from "~/utils/date";
import { formatMoney } from "~/utils/money";

export function LoanSummary({
  loan,
  totalInterest,
  originalAmount,
  showManage = false,
}: {
  loan: ILoan;
  totalInterest: number;
  originalAmount: number;
  showManage?: boolean;
}) {
  return (
    <Fieldset>
      <Flex justify="space-between">
        <Title order={4}>Loan Summary</Title>
        {showManage && loan.publicId !== "sample-loan" && (
          <Button
            component="a"
            href={`/loans/${loan.publicId}/manage`}
            variant="gradient"
            gradient={{ from: "blue", to: "teal", deg: 45 }}
          >
            Manage Loan
          </Button>
        )}
      </Flex>
      <Table withColumnBorders layout="auto">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Td>{loan.name}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Original Amount</Table.Th>
            <Table.Td>{formatMoney(originalAmount)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Current Amount</Table.Th>
            <Table.Td>{formatMoney(loan.amount)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Interest Rate</Table.Th>
            <Table.Td>{Number(loan.interestRate * 100).toFixed(3)}%</Table.Td>
          </Table.Tr>
          <Table.Tr>
            {/* nifty lil hack */}
            <Table.Th style={{ width: 5, whiteSpace: "nowrap" }}>
              Interest Paid To Date
            </Table.Th>
            <Table.Td>{formatMoney(totalInterest)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Term</Table.Th>
            <Table.Td>{loan.term} months</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Started</Table.Th>
            <Table.Td>{formatDate(loan.startAt)}</Table.Td>
          </Table.Tr>
        </Table.Thead>
      </Table>
    </Fieldset>
  );
}
