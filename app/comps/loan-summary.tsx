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
    <>
      <h3>Loan Summary</h3>
      {showManage && <a href={`/loans/${loan.publicId}/manage`}>Manage Loan</a>}
      <table border={1} cellPadding={8}>
        <tbody>
          <tr>
            <th>Loan Name</th>
            <td>{loan.name}</td>
          </tr>
          <tr>
            <th>Original Amount</th>
            <td>{formatMoney(originalAmount)}</td>
          </tr>
          <tr>
            <th>Current Amount</th>
            <td>{formatMoney(loan.amount)}</td>
          </tr>
          <tr>
            <th>Interest Rate</th>
            <td>{Number(loan.interestRate * 100).toFixed(3)}%</td>
          </tr>
          <tr>
            <th>Interest Paid To Date</th>
            <td>{formatMoney(totalInterest)}</td>
          </tr>
          <tr>
            <th>Term</th>
            <td>{loan.term} months</td>
          </tr>
          <tr>
            <th>Started</th>
            <td>{formatDate(loan.startAt)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
