import {
  Button,
  Fieldset,
  Flex,
  Menu,
  Modal,
  NumberInput,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { usePaymentHistory } from "~/hooks/use-payment-history";
import { formatDate } from "~/utils/date";
import { formatMoney } from "~/utils/money";

type Payment = ReturnType<typeof usePaymentHistory>["payments"][number];

interface PaymentHistoryTableProps {
  payments: Payment[];
  options?: {
    header: string | null;
    manage: boolean;
  };
  lastAdded?: string;
}

interface EditModalState {
  isOpen: boolean;
  paymentId: string;
  field: "principal" | "interest";
  value: number;
  otherValue: number;
}

interface RemoveModalState {
  isOpen: boolean;
  paymentId: string;
}

export function PaymentHistoryTable({
  payments,
  options: { header, manage } = { header: "Payment History", manage: false },
  lastAdded,
}: PaymentHistoryTableProps) {
  const [flashed, setFlashed] = useState(false);
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    paymentId: "",
    field: "principal",
    value: 0,
    otherValue: 0,
  });
  const [removeModal, setRemoveModal] = useState<RemoveModalState>({
    isOpen: false,
    paymentId: "",
  });

  useEffect(() => {
    setFlashed(true);
  }, []);

  const openEdit = (payment: Payment, field: "principal" | "interest") => {
    setEditModal({
      isOpen: true,
      paymentId: payment.id,
      field,
      value: payment[field],
      otherValue: field === "principal" ? payment.interest : payment.principal,
    });
  };

  return (
    <Fieldset pt="lg">
      <Title order={4} mb="md">
        {header}
      </Title>
      <Table.ScrollContainer minWidth={payments.length > 0 ? 600 : 0}>
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
              <Table.Tr
                key={payment.id}
                style={{
                  transition: "background-color .7s",
                  backgroundColor:
                    lastAdded === payment.id && !flashed
                      ? "color-mix(in srgb, var(--mantine-color-teal-9) 60%, transparent)"
                      : "inherit",
                }}
              >
                <Table.Td>{formatDate(payment.date)}</Table.Td>
                <Table.Td>{formatDate(payment.dueDate)}</Table.Td>
                <Table.Td>{formatMoney(payment.amount)}</Table.Td>
                <Table.Td>{formatMoney(payment.principal)}</Table.Td>
                <Table.Td>{formatMoney(payment.interest)}</Table.Td>
                <Table.Td>{formatMoney(payment.remaining)}</Table.Td>
                {manage && (
                  <Table.Td>
                    <Menu shadow="md" width={180} position="bottom-end">
                      <Menu.Target>
                        <Button size="compact-xs" variant="subtle" color="gray">
                          ⋯
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          onClick={() => openEdit(payment, "principal")}
                        >
                          Edit Principal
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => openEdit(payment, "interest")}
                        >
                          Edit Interest
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          onClick={() =>
                            setRemoveModal({
                              isOpen: true,
                              paymentId: payment.id,
                            })
                          }
                        >
                          Remove
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal
        opened={editModal.isOpen}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        title={`Edit ${editModal.field === "principal" ? "Principal" : "Interest"}`}
        size="sm"
      >
        <form method="post">
          <input type="hidden" name="form" value="edit-payment" />
          <input type="hidden" name="payment" value={editModal.paymentId} />
          <input
            type="hidden"
            name="principal"
            value={
              editModal.field === "principal"
                ? editModal.value
                : editModal.otherValue
            }
          />
          <input
            type="hidden"
            name="interest"
            value={
              editModal.field === "interest"
                ? editModal.value
                : editModal.otherValue
            }
          />
          <NumberInput
            label={
              editModal.field === "principal" ? "Principal" : "Interest"
            }
            value={editModal.value}
            onChange={(v) =>
              setEditModal({ ...editModal, value: Number(v) || 0 })
            }
            decimalScale={2}
            fixedDecimalScale
            prefix="$"
            min={0}
            step={0.01}
          />
          <Flex gap="sm" mt="md">
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "blue", to: "teal", deg: 45 }}
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditModal({ ...editModal, isOpen: false })}
            >
              Cancel
            </Button>
          </Flex>
        </form>
      </Modal>

      <Modal
        opened={removeModal.isOpen}
        onClose={() => setRemoveModal({ ...removeModal, isOpen: false })}
        title="Confirm Removal"
        size="sm"
      >
        <Text mb="lg">Are you sure you want to remove this payment?</Text>
        <form method="post">
          <input type="hidden" name="form" value="remove-payment" />
          <input type="hidden" name="payment" value={removeModal.paymentId} />
          <Flex gap="sm" justify="end">
            <Button
              variant="outline"
              onClick={() =>
                setRemoveModal({ ...removeModal, isOpen: false })
              }
            >
              Cancel
            </Button>
            <Button type="submit" color="red">
              Remove
            </Button>
          </Flex>
        </form>
      </Modal>
    </Fieldset>
  );
}
