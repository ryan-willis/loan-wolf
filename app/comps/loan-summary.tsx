import { Button, Fieldset, Flex, Table, Title } from "@mantine/core";
import { ILoan } from "~/types";
import { formatDate } from "~/utils/date";
import {
  formatInterestRate,
  formatMoney,
  getMonthlyPayment,
} from "~/utils/money";

export function LoanSummary({
  loan,
  originalAmount,
  showManage = false,
}: {
  loan: ILoan & { totalInterest: number; originalAmount: number };
  originalAmount: number;
  showManage?: boolean;
}) {
  return (
    <Fieldset pt="lg">
      <Flex justify="space-between" mb="md">
        <Title order={4}>Loan Summary</Title>
        {showManage && loan.publicId !== "sample-loan" && (
          <Button
            component="a"
            href={`/loans/${loan.publicId}/manage`}
            variant="gradient"
            size="compact-sm"
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
            <Table.Th>Monthly Payment</Table.Th>
            <Table.Td>{formatMoney(getMonthlyPayment(loan))}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Original Principal</Table.Th>
            <Table.Td>{formatMoney(originalAmount)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Principal Balance</Table.Th>
            <Table.Td>{formatMoney(loan.amount)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Interest Rate</Table.Th>
            <Table.Td>{formatInterestRate(loan.interestRate)}%</Table.Td>
          </Table.Tr>
          <Table.Tr>
            {/* nifty lil hack */}
            <Table.Th style={{ width: 5, whiteSpace: "nowrap" }}>
              Interest Paid To Date
            </Table.Th>
            <Table.Td>{formatMoney(loan.totalInterest)}</Table.Td>
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
