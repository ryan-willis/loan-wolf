import { Loan, Payment } from "@prisma/client";
import {
  Page,
  Text,
  View,
  Link,
  Document,
  StyleSheet,
  renderToBuffer,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Svg,
} from "@react-pdf/renderer";

import { useAmortize } from "~/hooks/use-amortize";
import { usePaymentHistory } from "~/hooks/use-payment-history";
import { formatDate, isWithinInterval } from "~/utils/date";
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
    flexDirection: "column",
    fontSize: 12,
    padding: 12,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

function Logo({
  h,
  w,
  fill = "url(#teal-blue)",
}: {
  h: number;
  w: number;
  fill?: string;
}) {
  return (
    <Svg height={h} width={w} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id="teal-blue" x1="0" y1="0" x2="1" y2="1">
          {/* --mantine-color-blue-filled */}
          <Stop offset="0%" stopColor="#1971c2" />

          {/* --mantine-color-teal-filled */}
          <Stop offset="100%" stopColor="#099268" />
        </LinearGradient>
      </Defs>
      <Path
        fill={fill}
        d="m123.56 150.2c-20.48 14.23-54.62 75.1-58.6 104.11-1.71 9.67-10.81 30.15-20.48 45.51-22.19 34.14-21.05 52.91 5.69 131.42 11.38 32.99 19.34 70.54 22.75 107.52 2.85 31.28 9.11 72.24 13.66 91.02 12.51 48.92 28.92 83.22 61.92 131.22 21 30 31.5 40.5 58.5 63 57 31.5 81 40.5 150 54 66 10.5 97.5 12 166.5 1.5 76.5-12 126-45 126-45l65.13-53.4c30.72-31.86 36.98-35.84 76.23-45.51 68.27-17.63 146.78-63.15 191.15-110.93l13.65-14.22-24.46-32.43c-19.34-24.46-58.6-61.44-78.51-73.96-1.13-1.13 13.09-16.49 31.86-35.27 46.08-44.37 48.93-57.46 20.48-87.61-34.13-35.27-84.76-65.99-137.1-81.92-42.67-13.65-50.63-18.77-86.47-53.47-70.54-69.41-169.53-105.82-275.91-101.26-51.2 2.27-63.15 5.12-112.07 25.6-30.16 12.51-62.01 25.03-71.12 26.73-17.06 3.42-22.75 1.14-78.5-39.25-14.79-10.81-30.72-19.91-34.7-19.91-3.42 0-15.36 5.69-25.6 12.51zm426.09 36.41c59.74 13.66 106.95 39.83 152.47 85.34 50.06 48.92 77.36 101.83 88.74 169.53l7.4 45.51 34.13 17.06c42.67 22.19 73.96 46.65 101.26 79.65l20.48 25.03-32.42 26.74c-42.1 33.56-102.4 62.57-149.62 71.68-34.13 6.82-39.82 10.24-75.09 45.51-21.05 21.05-52.34 46.65-69.41 56.89-19.91 11.94-47.09 23.45-107.09 39.95-70.5 6-82.5 4.5-154.5-3-70.5-16.5-112.5-36-112.5-36s-43.5-16.5-76.5-69c-43.5-63-70.51-121.96-70.51-194.21 0-27.88-14.22-96.71-25.03-125.16-2.85-6.25 0.57-8.53 11.94-8.53 21.62 0 22.19-10.24 1.14-17.07-9.67-3.41-21.05-10.81-25.6-17.06-12.51-17.07-9.67-51.2 5.69-69.41l13.65-15.93 3.99 15.93c2.27 9.1 1.7 18.78-2.85 23.9-10.24 12.51-5.12 34.13 8.54 34.13 9.1 0 11.94-4.55 13.08-25.03 1.14-13.66-2.28-36.98-7.96-51.77-9.11-24.46-9.11-29.58-1.71-49.49l8.53-21.62h50.63c28.45 0 59.17 2.84 68.84 6.82 21.62 8.54 47.79 2.85 105.24-21.61 80.79-35.27 126.87-39.26 215.04-18.78zm319.15 174.65c10.81 6.83 29.58 21.05 40.96 31.29l21.05 19.34-11.95 15.93c-12.51 17.64-56.89 51.2-66.56 51.2-11.94 0-29.01-22.75-29.01-38.68 0-8.54-7.97-36.98-17.07-63.72s-17.06-48.92-17.06-49.49c0-3.41 62 23.32 79.64 34.13z"
      />
      <Path
        fill={fill}
        d="m342.58 337.37c-4.55 6.83-5.12 6.83 18.77 18.77 30.15 15.36 42.1 39.82 39.25 78.51-2.27 25.03-1.13 32.99 4.56 32.99 19.34 0 21.04-64.28 2.84-93.29-11.38-18.78-42.67-43.24-55.75-43.24-3.41 0-7.97 2.85-9.67 6.26z"
      />
      <Path
        fill={fill}
        d="m789.16 543.88c0 3.98 13.65 14.22 30.15 22.75 17.06 7.97 35.27 19.34 40.39 25.6 9.1 10.24 9.1 11.38-6.83 22.76-9.1 6.25-29.01 15.93-43.8 21.61-32.43 11.95-40.39 24.47-15.93 24.47 22.75 0 75.09-27.88 89.31-46.65l11.38-15.93-17.07-17.64c-15.92-17.06-65.42-44.94-80.21-44.94-3.98 0-7.39 3.41-7.39 7.97z"
      />
    </Svg>
  );
}

const AmortizationPages = ({
  amortizationPayments,
}: {
  amortizationPayments: ReturnType<typeof useAmortize>["payments"];
}) => {
  const pageSize = 50;
  const pages = [];
  for (let i = 0; i < amortizationPayments.length; i += pageSize) {
    pages.push(amortizationPayments.slice(i, i + pageSize));
  }
  return (
    <>
      {pages.map((page, i) => (
        <Page key={i} size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <Text
              style={{
                backgroundColor: "black",
                color: "white",
                padding: 4,
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              Amortization Schedule (Page {i + 1} of {pages.length})
            </Text>
            <View style={{ ...styles.vert, fontSize: 10 }}>
              <View
                style={{
                  ...styles.horiz,
                  fontWeight: "bold",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #000000",
                }}
              >
                <Text style={{ width: "25%" }}>Date</Text>
                <Text style={{ width: "25%", textAlign: "right" }}>
                  Principal
                </Text>
                <Text style={{ width: "25%", textAlign: "right" }}>
                  Interest
                </Text>
                <Text style={{ width: "25%", textAlign: "right" }}>
                  Balance
                </Text>
              </View>
              {page.map((p, j) => (
                <View
                  key={j}
                  style={{
                    ...styles.horiz,
                    borderBottom: "1px solid #555555",
                    paddingTop: 2,
                  }}
                >
                  <Text style={{ width: "25%" }}>{formatDate(p.date)}</Text>
                  <Text style={{ width: "25%", textAlign: "right" }}>
                    {formatMoney(p.principal)}
                  </Text>
                  <Text style={{ width: "25%", textAlign: "right" }}>
                    {formatMoney(p.interest)}
                  </Text>
                  <Text style={{ width: "25%", textAlign: "right" }}>
                    {formatMoney(p.remaining)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Page>
      ))}
    </>
  );
};

// Create Document Component
const LoanStatementDocument = (args: {
  linkUrl?: string;
  loan: Loan;
  payments: Payment[];
}) => {
  const { payments, loan } = usePaymentHistory({
    loan: args.loan,
    payments: args.payments,
  });
  const { payments: originalAmortizationPayments } = useAmortize({
    loan: {
      ...args.loan,
      totalInterest: 0,
      originalAmount: args.loan.amount,
    },
    payments: [],
  });
  const { payments: amortizationPayments } = useAmortize({
    loan,
    payments,
  });
  const currentPayment = amortizationPayments.shift()!;

  const { principal, interest } = getPrincipalInterestSpread(loan, {
    amount: currentPayment.total,
  });

  const statementTime = currentPayment.date.getTime() - FOURTEEN_DAYS;

  const recentPayments = payments.filter((p) =>
    isWithinInterval(p.date, {
      start: statementTime - 90 * 24 * 60 * 60 * 1000,
      end: currentPayment.date.getTime(),
    })
  );

  const originalMaturityDate =
    originalAmortizationPayments[originalAmortizationPayments.length - 1].date;

  const currentMaturityDate =
    amortizationPayments[amortizationPayments.length - 1].date;

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
            <Logo w={45} h={45} />
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
                <Text>{formatMoney(getMonthlyPayment(loan))}</Text>
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
                  {formatMoney(loan.originalAmount)}
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
                <Text style={{ fontSize: 10 }}>Original Maturity Date</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatDate(originalMaturityDate)}
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Maturity Date</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatDate(currentMaturityDate)}
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
                <Text style={{ fontSize: 10 }}>{args.loan.term} months</Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Principal Balance</Text>
                <Text style={{ fontSize: 10 }}>{formatMoney(loan.amount)}</Text>
              </View>

              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Principal Paid To Date</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatMoney(
                    payments.reduce((acc, p) => acc + p.principal, 0)
                  )}
                </Text>
              </View>
              <View
                style={{ ...styles.horiz, justifyContent: "space-between" }}
              >
                <Text style={{ fontSize: 10 }}>Interest Paid To Date</Text>
                <Text style={{ fontSize: 10 }}>
                  {formatMoney(
                    payments.reduce((acc, p) => acc + p.interest, 0)
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
              marginTop: 90,
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
      {amortizationPayments.length > 0 && (
        <AmortizationPages amortizationPayments={amortizationPayments} />
      )}
    </Document>
  );
};

export const getLoanStatementPDF = async (args: {
  linkUrl?: string;
  loan: Loan;
  payments: Payment[];
}) => renderToBuffer(<LoanStatementDocument {...args} />);
