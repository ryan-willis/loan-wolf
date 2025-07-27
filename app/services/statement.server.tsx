import { Loan, Payment } from "@prisma/client";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  renderToBuffer,
  Link,
} from "@react-pdf/renderer";
// import { PDFLogo } from "~/comps/logo";
import { formatDate } from "~/utils/date";
import { hashCode } from "~/utils/hash";
import { formatMoney, getMonthlyPayment } from "~/utils/money";

const styles = StyleSheet.create({
  colView: {
    display: "flex",
    flexDirection: "column",
  },
  rowView: {
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
const LoanStatementDocument = ({
  linkUrl,
  loan,
  payments,
}: {
  linkUrl?: string;
  loan: Loan;
  payments: Payment[];
}) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <View style={styles.section}>
        <View
          style={{
            ...styles.rowView,
            // alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* <PDFLogo h={38} w={200} /> */}
          <View style={styles.colView}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Loan Statement
            </Text>
            {linkUrl && (
              <Text style={{ fontSize: 10 }}>
                <Link src={linkUrl}>{linkUrl}</Link>
              </Text>
            )}
          </View>

          <View
            style={{
              ...styles.colView,
              alignItems: "flex-end",
            }}
          >
            <Text style={{ fontSize: 10 }}>Loan Number</Text>
            <Text style={{ fontSize: 12 }}>{hashCode(loan.publicId)}</Text>
            <Text>&nbsp;</Text>
            <Text style={{ fontSize: 14 }}>
              Total due on {formatDate(loan.startAt)}:
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {formatMoney(getMonthlyPayment(loan))}
            </Text>
          </View>
        </View>
        <View
          style={{
            color: "white",
            backgroundColor: "black",
            padding: 4,
            marginTop: 10,
          }}
        >
          <Text>Current Payment</Text>
        </View>
        <View>
          <Text>Loan number: {hashCode(loan.publicId)}</Text>
        </View>
        <Text>{loan.publicId}</Text>
        <Text>{loan.amount}</Text>
        <Text>{loan.interestRate}</Text>
        <Text>{loan.term}</Text>
        <Text>{loan.startAt}</Text>
        <Text>{payments.length}</Text>
      </View>
    </Page>
  </Document>
);

export const getLoanStatementPDF = async (args: {
  linkUrl?: string;
  loan: Loan;
  payments: Payment[];
}) => renderToBuffer(<LoanStatementDocument {...args} />);
