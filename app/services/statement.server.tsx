import { Loan, Payment } from "@prisma/client";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { PDFLogo } from "~/comps/logo";
import { formatDate } from "~/utils/date";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

// Create Document Component
const LoanStatementDocument = ({
  loan,
  payments,
}: {
  loan: Loan;
  payments: Payment[];
}) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <View style={styles.section}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <PDFLogo h={38} w={200} />
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {formatDate(loan.startAt)}
          </Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Statement</Text>
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

export const getLoanStatementPDF = async ({
  loan,
  payments,
}: {
  loan: Loan;
  payments: Payment[];
}) => renderToBuffer(<LoanStatementDocument loan={loan} payments={payments} />);
