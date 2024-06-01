import { Fieldset, Table, Title } from "@mantine/core";
import { usePaymentHistory } from "~/hooks/use-payment-history";
import { formatDate } from "~/utils/date";
import { formatMoney } from "~/utils/money";

interface PaymentHistoryTableProps {
  payments: ReturnType<typeof usePaymentHistory>["payments"];
  options?: {
    header: string | null;
    manage: boolean;
  };
}

export function PaymentHistoryTable({
  payments,
  options: { header, manage } = { header: "Payment History", manage: false },
}: PaymentHistoryTableProps) {
  return (
    <Fieldset pt="lg">
      <Title order={4}>{header}</Title>
      <Table.ScrollContainer minWidth={600}>
        <Table withColumnBorders>
          {payments.length > 0 && (
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Payment Date</Table.Th>
                <Table.Th>Due Date</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Principal</Table.Th>
                <Table.Th>Interest</Table.Th>
                <Table.Th>Balance</Table.Th>
              </Table.Tr>
            </Table.Thead>
          )}
          <Table.Tbody>
            {payments.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6} pt="xl">
                  No payments have been added yet
                </Table.Td>
              </Table.Tr>
            )}
            {payments.map((payment) => (
              <Table.Tr key={payment.id}>
                <Table.Td>{formatDate(payment.date)}</Table.Td>
                <Table.Td>{formatDate(payment.dueDate)}</Table.Td>
                <Table.Td>{formatMoney(payment.amount)}</Table.Td>
                <Table.Td>{formatMoney(payment.principal)}</Table.Td>
                <Table.Td>{formatMoney(payment.interest)}</Table.Td>
                <Table.Td>{formatMoney(payment.remaining)}</Table.Td>
                {manage && (
                  <Table.Td>
                    <form method="post">
                      <input type="hidden" name="form" value="remove-payment" />
                      <input type="hidden" name="payment" value={payment.id} />
                      <button>Remove</button>
                    </form>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Fieldset>
  );
}
