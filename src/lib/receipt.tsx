import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatINR } from "@/lib/format";

export interface ReceiptData {
  receiptNumber: string;
  issuedAt: Date;
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  lineItems: { label: string; amountPaise: number }[];
  totalPaise: number;
  razorpayPaymentId: string | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0a0a0a",
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#6b6b6b",
  },
  h1: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 6 },
  metaBlock: { marginTop: 24, flexDirection: "row", justifyContent: "space-between" },
  metaCell: { flexDirection: "column", gap: 2 },
  label: { fontSize: 8, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: 1 },
  value: { fontSize: 10 },
  table: { marginTop: 28, borderTopWidth: 1, borderTopColor: "#e4e4e4" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e4",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginTop: 4,
  },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 40, left: 48, right: 48, fontSize: 8, color: "#6b6b6b" },
});

function ReceiptDocument({ data }: { data: ReceiptData }) {
  return (
    <Document title={`Receipt ${data.receiptNumber}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Website Ordering Platform</Text>
        <Text style={styles.h1}>Payment receipt</Text>

        <View style={styles.metaBlock}>
          <View style={styles.metaCell}>
            <Text style={styles.label}>Receipt no.</Text>
            <Text style={styles.value}>{data.receiptNumber}</Text>
            <Text style={styles.label}>Issued</Text>
            <Text style={styles.value}>
              {data.issuedAt.toISOString().slice(0, 10)}
            </Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.label}>Billed to</Text>
            <Text style={styles.value}>{data.customerName ?? data.customerEmail}</Text>
            <Text style={styles.value}>{data.customerEmail}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.label}>Order</Text>
            <Text style={styles.value}>{data.orderId}</Text>
            {data.razorpayPaymentId ? (
              <>
                <Text style={styles.label}>Payment ref</Text>
                <Text style={styles.value}>{data.razorpayPaymentId}</Text>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          {data.lineItems.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text>{item.label}</Text>
              <Text>{formatINR(item.amountPaise)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalValue}>{formatINR(data.totalPaise)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Amounts marked &quot;from&quot; are baselines; the final invoice may
          differ once scope is confirmed. All amounts in INR.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return renderToBuffer(<ReceiptDocument data={data} />);
}
