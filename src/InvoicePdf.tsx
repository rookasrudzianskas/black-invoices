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
  formatIban,
  formatRate,
  getTaxCountry,
  invoiceSubtotal,
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

const PartyBlock = ({
  title,
  party,
  taxIdLabel,
}: {
  title: string;
  party: Party;
  taxIdLabel: string;
}) => (
  <View style={styles.partyBlock}>
    <Text style={styles.label}>{title}</Text>
    <Text style={styles.line}>{party.name}</Text>
    <Text style={styles.line}>{party.email}</Text>
    <Text style={styles.line}>{party.phone}</Text>
    <Text style={styles.line}>{party.address}</Text>
    <Text style={styles.line}>{party.cityLine}</Text>
    <Text style={styles.line}>
      {taxIdLabel}: {party.vatId}
    </Text>
  </View>
);

export const InvoicePdf = ({ data }: InvoicePdfProps) => {
  const invoice = invoiceWithResolvedTotal(data);
  const taxCountry = getTaxCountry(invoice.taxCountryCode);
  const subtotal = invoiceSubtotal(invoice);

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
            {formatDate(invoice.issueDate, invoice.taxCountryCode)}
          </Text>
          <Text style={[styles.metaItem, styles.metaRight]}>
            <Text style={styles.muted}>Due date: </Text>
            {formatDate(invoice.dueDate, invoice.taxCountryCode)}
          </Text>
        </View>

        <View style={styles.fromBlock}>
          <PartyBlock
            taxIdLabel={taxCountry.taxIdLabel}
            title="From"
            party={invoice.from}
          />
        </View>
        <View style={styles.toBlock}>
          <PartyBlock
            taxIdLabel={taxCountry.taxIdLabel}
            title="To"
            party={invoice.to}
          />
        </View>

        <View style={styles.items}>
          <View style={styles.itemHeader}>
            <Text style={[styles.label, styles.itemName]}>Item</Text>
            <Text style={[styles.label, styles.itemQuantity]}>Qty</Text>
            <Text style={[styles.label, styles.itemPrice]}>Unit price</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.line, styles.itemName]}>{item.item}</Text>
              <Text style={[styles.line, styles.itemQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.line, styles.itemPrice]}>
                {formatCurrency(item.price, {
                  countryCode: invoice.taxCountryCode,
                  grouped: false,
                })}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.taxRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.taxValue}>
              {formatCurrency(subtotal, {
                countryCode: invoice.taxCountryCode,
                decimals: 2,
              })}
            </Text>
          </View>
          <View style={styles.taxRow}>
            <Text style={styles.label}>
              {taxCountry.taxName} {formatRate(taxCountry.rate)}
            </Text>
            <Text style={styles.taxValue}>
              {formatCurrency(invoice.salesTax, {
                countryCode: invoice.taxCountryCode,
                decimals: 2,
                grouped: true,
              })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.total, {
                countryCode: invoice.taxCountryCode,
                decimals: 2,
                grouped: true,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.payment}>
          <Text style={styles.label}>Payment details</Text>
          <Text style={styles.line}>
            Beneficiary: {invoice.payment.beneficiary}
          </Text>
          <Text style={styles.line}>Bank: {invoice.payment.bank}</Text>
          <Text style={styles.line}>IBAN: {formatIban(invoice.payment.iban)}</Text>
          <Text style={styles.line}>
            BIC/SWIFT: {invoice.payment.bic}
          </Text>
          <Text style={styles.line}>Reference: {invoice.payment.reference}</Text>
          <Text style={styles.line}>{invoice.payment.terms}</Text>
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
    fontSize: 11.45,
    lineHeight: 1.58,
    position: "relative",
  },
  logo: {
    position: "absolute",
    left: 38,
    top: 38,
    width: 66,
    height: 66,
    backgroundColor: colors.logoPaper,
  },
  logoText: {
    color: colors.paper,
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1,
    marginLeft: 18,
    marginTop: 16,
  },
  metaRow: {
    position: "absolute",
    left: 38,
    right: 38,
    top: 151,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 11.2,
  },
  metaItem: {
    width: 158,
    color: colors.ink,
  },
  metaRight: {
    textAlign: "right",
    width: 170,
  },
  muted: {
    color: colors.muted,
  },
  fromBlock: {
    position: "absolute",
    left: 38,
    top: 216,
    width: 246,
  },
  toBlock: {
    position: "absolute",
    left: 316,
    top: 216,
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
    left: 38,
    top: 378,
    width: 519,
  },
  itemHeader: {
    display: "flex",
    flexDirection: "row",
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
    marginTop: 4,
  },
  itemName: {
    width: 314,
  },
  itemQuantity: {
    width: 58,
  },
  itemPrice: {
    width: 147,
    textAlign: "right",
  },
  totals: {
    position: "absolute",
    left: 316,
    top: 500,
    width: 241,
  },
  taxRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  taxValue: {
    color: colors.muted,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.rule,
    marginTop: 7,
    marginBottom: 18,
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  totalValue: {
    color: colors.ink,
    fontSize: 23,
    lineHeight: 1,
  },
  payment: {
    position: "absolute",
    left: 38,
    top: 690,
    width: 252,
  },
  note: {
    position: "absolute",
    left: 316,
    top: 690,
    width: 241,
  },
});
