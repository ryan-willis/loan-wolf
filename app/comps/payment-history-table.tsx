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
  // todo: memoize? nah
  return (
    <>
      <h3>{header}</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Payment Date</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 && (
            <tr>
              <td colSpan={6} align="center">
                No payments have been added yet
              </td>
            </tr>
          )}
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{formatDate(payment.date)}</td>
              <td>{formatDate(payment.dueDate)}</td>
              <td>{formatMoney(payment.amount)}</td>
              <td>{formatMoney(payment.principal)}</td>
              <td>{formatMoney(payment.interest)}</td>
              <td>{formatMoney(payment.remaining)}</td>
              {manage && (
                <td>
                  <form method="post">
                    <input type="hidden" name="form" value="remove-payment" />
                    <input type="hidden" name="payment" value={payment.id} />
                    <button>Remove</button>
                  </form>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
