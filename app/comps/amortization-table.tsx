import { useAmortize } from "~/hooks/use-amortize";
import { formatDate } from "~/utils/date";
import { formatMoney } from "~/utils/money";

interface AmortizationTableProps {
  payments: ReturnType<typeof useAmortize>["payments"];
  total: ReturnType<typeof useAmortize>["total"];
}

export function AmortizationTable({ payments, total }: AmortizationTableProps) {
  return (
    <>
      <h3>Amortization Schedule</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Payment Date</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Total</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, i) => (
            <tr key={i}>
              <td>{formatDate(payment.date)}</td>
              <td>{formatMoney(payment.principal)}</td>
              <td>{formatMoney(payment.interest)}</td>
              <td>{formatMoney(payment.total)}</td>
              <td>{formatMoney(payment.remaining)}</td>
            </tr>
          ))}
          <tr>
            <td>Total</td>
            <td>{formatMoney(total.principal)}</td>
            <td>{formatMoney(total.interest)}</td>
            <td>{formatMoney(total.total)}</td>
            <td>{formatMoney(total.remaining)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
