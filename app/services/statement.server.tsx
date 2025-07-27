import { Loan, Payment } from "@prisma/client";
import {
  Page,
  Text,
  View,
  Link,
  Document,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { PDFLogo } from "~/comps/logo";
import { useAmortize } from "~/hooks/use-amortize";
import { usePaymentHistory } from "~/hooks/use-payment-history";
// import { PDFLogo } from "~/comps/logo";
import { formatDate, isWithinInterval } from "~/utils/date";
// import { hashCode } from "~/utils/hash";
import {
  formatInterestRate,
  formatMoney,
  getPrincipalInterestSpread,
  getMonthlyPayment,
} from "~/utils/money";

const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

const styles = StyleSheet.create({
  vert: {
    display: "flex",
    flexDirection: "column",
  },
  horiz: {
    display: "flex",
    flexDirection: "row",
  },
  page: {
    flexDirection: "row",
    // backgroundColor: "#FFFFFF",
    fontSize: 12,
    padding: 12,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

// Create Document Component
const LoanStatementDocument = (args: {
  linkUrl?: string;
  loan: Loan;
  payments: Payment[];
}) => {
  const { payments: adjustedPayments, loan: adjustedLoan } = usePaymentHistory({
    loan: args.loan,
    payments: args.payments,
  });
  const { payments: amortizationPayments } = useAmortize({
    loan: adjustedLoan,
    payments: adjustedPayments,
  });
  const currentPayment = amortizationPayments[0];
  const { principal, interest } = getPrincipalInterestSpread(adjustedLoan, {
    amount: currentPayment.total,
  });

  const statementTime = currentPayment.date.getTime() - FOURTEEN_DAYS;

  const recentPayments = adjustedPayments.filter((p) =>
    isWithinInterval(p.date, {
      start: statementTime - 90 * 24 * 60 * 60 * 1000,
      end: currentPayment.date.getTime(),
    })
  );

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <View
            style={{
              ...styles.horiz,
              justifyContent: "space-between",
            }}
          >
            <PDFLogo w={45} h={45} />

            <View
              style={{
                ...styles.vert,
                alignItems: "flex-end",
                gap: 3,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                Loan Statement
              </Text>
              <Text style={{ fontSize: 12 }}>
                Statement Date: {formatDate(statementTime)}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 70,
              ...styles.horiz,
              justifyContent: "space-between",
              gap: 30,
            }}
          >
            <View
              style={{
                fontStyle: "italic",
                width: "48%",
                ...styles.vert,
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 10 }}>
                This statement was generated using Loan Wolf at{" "}
                {new Date().toLocaleString("utc", {
                  timeZone: "UTC",
                  timeZoneName: "short",
                })}
                .
              </Text>
              <Text style={{ fontSize: 10 }}>
                Learn more about Loan Wolf at{" "}
                <Link style={{ color: "black" }} src="https://loanwolf.app">
                  https://loanwolf.app
                </Link>
                .
              </Text>
            </View>
            <View
              style={{
                border: "1px solid #000000",
                padding: 6,
                width: "48%",
                gap: 8,
              }}
            >
              {/* TODO: consider adding a loan number to be a lil more standard */}
              {/* <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 12 }}>Loan Number</Text>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                  {hashCode(loan.publicId)}
                </Text>
              </View> */}
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 12 }}>Loan Name</Text>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                  {args.loan.name}
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 12 }}>Payment Due Date</Text>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                  {formatDate(currentPayment.date)}
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                  Total Amount Due
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {formatMoney(currentPayment.total)}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              color: "white",
              backgroundColor: "black",
              padding: 4,
              marginTop: 60,
            }}
          >
            <Text>Current Payment</Text>
          </View>

          <View
            style={{
              ...styles.horiz,
              justifyContent: "space-between",
              paddingTop: 10,
            }}
          >
            <View style={{ ...styles.vert, gap: 4, width: "46%" }}>
              <View
                style={{
                  borderBottom: "1px solid #000000",
                  width: "100%",
                  paddingBottom: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  Payment Breakdown
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Principal</Text>
                <Text style={{ fontSize: 10 }}>{formatMoney(principal)}</Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Interest</Text>
                <Text style={{ fontSize: 10 }}>{formatMoney(interest)}</Text>
              </View>
              <View
                style={{
                  borderTop: "1px solid #000000",
                  width: "100%",
                  paddingTop: 4,
                  ...styles.horiz,
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              >
                <Text>Regular Monthly Payment</Text>
                <Text>{formatMoney(getMonthlyPayment(adjustedLoan))}</Text>
              </View>
            </View>

            <View style={{ ...styles.vert, gap: 4, width: "46%" }}>
              <View
                style={{
                  borderBottom: "1px solid #000000",
                  width: "100%",
                  paddingBottom: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  Loan Summary
                </Text>
              </View>

              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Original Principal</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatMoney(adjustedLoan.originalAmount)}
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Origination Date</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatDate(args.loan.startAt)}
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Interest Rate</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatInterestRate(args.loan.interestRate)}%
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Term</Text>
                <Text style={{ fontSize: 10 }}>{args.loan.term} months)</Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Current Principal Balance</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatMoney(adjustedLoan.amount)}
                </Text>
              </View>

              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Principal Paid To Date</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatMoney(
                    adjustedPayments.reduce((acc, p) => acc + p.principal, 0)
                  )}
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Interest Paid To Date</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatMoney(
                    adjustedPayments.reduce((acc, p) => acc + p.interest, 0)
                  )}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              color: "white",
              backgroundColor: "black",
              padding: 4,
              marginTop: 120,
            }}
          >
            <Text>Payment History (90 days)</Text>
          </View>
          <View style={{ marginTop: 10, fontSize: 10 }}>
            <View
              style={{
                borderBottom: "1px solid #000000",
                width: "100%",
                paddingBottom: 4,
                ...styles.horiz,
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              <Text style={{ width: "20%" }}>Date</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>Payment</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>
                Principal
              </Text>
              <Text style={{ width: "20%", textAlign: "right" }}>Interest</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>Balance</Text>
            </View>
            {recentPayments.map((p) => (
              <View
                key={p.id}
                style={{
                  ...styles.horiz,
                  justifyContent: "space-between",
                  marginTop: 2,
                }}
              >
                <Text style={{ width: "20%" }}>{formatDate(p.date)}</Text>
                <Text style={{ width: "20%", textAlign: "right" }}>
                  {formatMoney(p.amount)}
                </Text>
                <Text style={{ width: "20%", textAlign: "right" }}>
                  {formatMoney(p.principal)}
                </Text>
                <Text style={{ width: "20%", textAlign: "right" }}>
                  {formatMoney(p.interest)}
                </Text>
                <Text style={{ width: "20%", textAlign: "right" }}>
                  {formatMoney(p.remaining)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const getLoanStatementPDF = async (args: {
  linkUrl?: string;
  loan: Loan;
  payments: Payment[];
}) => renderToBuffer(<LoanStatementDocument {...args} />);
