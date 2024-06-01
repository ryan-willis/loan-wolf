import {
  Button,
  Collapse,
  Fieldset,
  Flex,
  Space,
  Table,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAmortize } from "~/hooks/use-amortize";
import { formatDate } from "~/utils/date";
import { formatMoney } from "~/utils/money";

interface AmortizationTableProps {
  payments: ReturnType<typeof useAmortize>["payments"];
  total: ReturnType<typeof useAmortize>["total"];
}

export function AmortizationTable({ payments, total }: AmortizationTableProps) {
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <Fieldset pt="lg">
      <Flex justify="space-between">
        <Title order={4}>Amortization Schedule</Title>
        <Button
          onClick={toggle}
          size="compact-sm"
          variant="gradient"
          gradient={{
            from: "teal",
            to: "blue",
            deg: 45,
          }}
        >
          {opened ? "Hide" : "Show"}
        </Button>
      </Flex>
      <Collapse in={opened}>
        <Space h="xs" />
        <Table.ScrollContainer minWidth={600}>
          <Table withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Payment Date</Table.Th>
                <Table.Th>Principal</Table.Th>
                <Table.Th>Interest</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Balance</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {payments.map((payment, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{formatDate(payment.date)}</Table.Td>
                  <Table.Td>{formatMoney(payment.principal)}</Table.Td>
                  <Table.Td>{formatMoney(payment.interest)}</Table.Td>
                  <Table.Td>{formatMoney(payment.total)}</Table.Td>
                  <Table.Td>{formatMoney(payment.remaining)}</Table.Td>
                </Table.Tr>
              ))}
              <Table.Tr>
                <Table.Th>Total</Table.Th>
                <Table.Th>{formatMoney(total.principal)}</Table.Th>
                <Table.Th>{formatMoney(total.interest)}</Table.Th>
                <Table.Th>{formatMoney(total.total)}</Table.Th>
                <Table.Th>{formatMoney(total.remaining)}</Table.Th>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Collapse>
    </Fieldset>
  );
}
