import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import path from "node:path";
import {
  formatCurrency,
  formatDate,
  formatRate,
  getTaxCountry,
  invoiceWithResolvedTotal,
  type InvoiceData,
  type Party,
} from "./invoice";

const geistMonoRegular = path.join(
  process.cwd(),
  "public/fonts/GeistMono-Regular.ttf",
);
const geistMonoBold = path.join(
  process.cwd(),
  "public/fonts/GeistMono-Bold.ttf",
);

Font.register({
  family: "GeistMono",
  fonts: [
    { src: geistMonoRegular, fontWeight: 400 },
    { src: geistMonoBold, fontWeight: 700 },
  ],
});

type InvoicePdfProps = {
  data: InvoiceData;
};

const PartyBlock = ({ title, party }: { title: string; party: Party }) => (
  <View style={styles.partyBlock}>
    <Text style={styles.label}>{title}</Text>
    <Text style={styles.line}>{party.name}</Text>
    <Text style={styles.line}>{party.email}</Text>
    <Text style={styles.line}>{party.phone}</Text>
    <Text style={styles.line}>{party.address}</Text>
    <Text style={styles.line}>{party.cityLine}</Text>
    <Text style={styles.line}>VAT ID: {party.vatId}</Text>
  </View>
);

export const InvoicePdf = ({ data }: InvoicePdfProps) => {
  const invoice = invoiceWithResolvedTotal(data);
  const taxCountry = getTaxCountry(invoice.taxCountryCode);

  return (
    <Document
      author="Black Invoices"
      creator="Black Invoices"
      producer="Black Invoices"
      subject={`Invoice ${invoice.invoiceNo}`}
      title={`Invoice ${invoice.invoiceNo}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.logo}>
          {!invoice.logoDataUrl ? (
            <Text style={styles.logoText}>{invoice.logoLetter || "L"}</Text>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>
            <Text style={styles.muted}>Invoice NO: </Text>
            {invoice.invoiceNo}
          </Text>
          <Text style={styles.metaItem}>
            <Text style={styles.muted}>Issue date: </Text>
            {formatDate(invoice.issueDate)}
          </Text>
          <Text style={[styles.metaItem, styles.metaRight]}>
            <Text style={styles.muted}>Due date: </Text>
            {formatDate(invoice.dueDate)}
          </Text>
        </View>

        <View style={styles.fromBlock}>
          <PartyBlock title="From" party={invoice.from} />
        </View>
        <View style={styles.toBlock}>
          <PartyBlock title="To" party={invoice.to} />
        </View>

        <View style={styles.items}>
          <View style={styles.itemHeader}>
            <Text style={[styles.label, styles.itemName]}>Item</Text>
            <Text style={[styles.label, styles.itemQuantity]}>Quantity</Text>
            <Text style={[styles.label, styles.itemPrice]}>Price</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.line, styles.itemName]}>{item.item}</Text>
              <Text style={[styles.line, styles.itemQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.line, styles.itemPrice]}>
                {formatCurrency(item.price, { grouped: false })}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.taxRow}>
            <Text style={styles.label}>
              {taxCountry.taxName} {formatRate(taxCountry.rate)}
            </Text>
            <Text style={styles.taxValue}>
              {formatCurrency(invoice.salesTax, { grouped: true })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.total, { decimals: 2, grouped: true })}
            </Text>
          </View>
        </View>

        <View style={styles.payment}>
          <Text style={styles.label}>Payment details</Text>
          <Text style={styles.line}>Bank: {invoice.payment.bank}</Text>
          <Text style={styles.line}>
            Account number: {invoice.payment.accountNumber},
          </Text>
          <Text style={styles.line}>Iban: {invoice.payment.iban},</Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.label}>Note</Text>
          <Text style={styles.line}>{invoice.note}</Text>
        </View>
      </Page>
    </Document>
  );
};

const colors = {
  paper: "#101010",
  ink: "#f2f1ed",
  muted: "#767676",
  rule: "#303030",
  logoPaper: "#eeeeec",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: "GeistMono",
    fontSize: 12.7,
    lineHeight: 1.62,
    position: "relative",
  },
  logo: {
    position: "absolute",
    left: 26,
    top: 35,
    width: 72,
    height: 72,
    backgroundColor: colors.logoPaper,
  },
  logoText: {
    color: colors.paper,
    fontSize: 45,
    fontWeight: 700,
    lineHeight: 1,
    marginLeft: 20,
    marginTop: 19,
  },
  metaRow: {
    position: "absolute",
    left: 26,
    right: 26,
    top: 153,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 12.3,
  },
  metaItem: {
    width: 168,
    color: colors.ink,
  },
  metaRight: {
    textAlign: "right",
    width: 180,
  },
  muted: {
    color: colors.muted,
  },
  fromBlock: {
    position: "absolute",
    left: 26,
    top: 211,
    width: 220,
  },
  toBlock: {
    position: "absolute",
    left: 296,
    top: 211,
    width: 240,
  },
  partyBlock: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    color: colors.muted,
    fontWeight: 400,
  },
  line: {
    color: colors.ink,
  },
  items: {
    position: "absolute",
    left: 26,
    top: 397,
    width: 543,
  },
  itemHeader: {
    display: "flex",
    flexDirection: "row",
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
  },
  itemName: {
    width: 278,
  },
  itemQuantity: {
    width: 118,
  },
  itemPrice: {
    width: 147,
    textAlign: "right",
  },
  totals: {
    position: "absolute",
    left: 296,
    top: 488,
    width: 265,
  },
  taxRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taxValue: {
    color: colors.muted,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.rule,
    marginTop: 13,
    marginBottom: 19,
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  totalValue: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 1,
  },
  payment: {
    position: "absolute",
    left: 26,
    top: 737,
    width: 245,
  },
  note: {
    position: "absolute",
    left: 286,
    top: 737,
    width: 285,
  },
});
