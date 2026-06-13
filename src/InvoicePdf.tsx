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
  displayValue,
  formatCurrency,
  formatDate,
  formatIban,
  formatRate,
  getInvoiceCopy,
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
const notoSansMonoGreek = path.join(
  process.cwd(),
  "node_modules/@fontsource/noto-sans-mono/files/noto-sans-mono-greek-400-normal.woff",
);
const notoSansMonoCyrillic = path.join(
  process.cwd(),
  "node_modules/@fontsource/noto-sans-mono/files/noto-sans-mono-cyrillic-400-normal.woff",
);
const notoSansArmenian = path.join(
  process.cwd(),
  "node_modules/@fontsource/noto-sans-armenian/files/noto-sans-armenian-armenian-400-normal.woff",
);
const notoSansGeorgian = path.join(
  process.cwd(),
  "node_modules/@fontsource/noto-sans-georgian/files/noto-sans-georgian-georgian-400-normal.woff",
);

Font.register({
  family: "GeistMono",
  fonts: [
    { src: geistMonoRegular, fontWeight: 400 },
    { src: geistMonoBold, fontWeight: 700 },
  ],
});
Font.register({ family: "NotoSansMonoGreek", src: notoSansMonoGreek });
Font.register({ family: "NotoSansMonoCyrillic", src: notoSansMonoCyrillic });
Font.register({ family: "NotoSansArmenian", src: notoSansArmenian });
Font.register({ family: "NotoSansGeorgian", src: notoSansGeorgian });

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
    <Text style={styles.line}>{displayValue(party.name)}</Text>
    <Text style={styles.line}>{displayValue(party.email)}</Text>
    <Text style={styles.line}>{displayValue(party.phone)}</Text>
    <Text style={styles.line}>{displayValue(party.address)}</Text>
    <Text style={styles.line}>{displayValue(party.cityLine)}</Text>
    <Text style={styles.line}>
      {taxIdLabel}: {displayValue(party.vatId)}
    </Text>
  </View>
);

const MetaItem = ({
  label,
  value,
  align = "left",
}: {
  align?: "left" | "right";
  label: string;
  value: string;
}) => (
  <View
    style={align === "right" ? [styles.metaItem, styles.metaRight] : styles.metaItem}
  >
    <Text style={styles.muted}>{label}</Text>
    <Text style={styles.line}>{displayValue(value)}</Text>
  </View>
);

const invoiceFontFamily = (invoice: InvoiceData) => {
  if (invoice.languageMode !== "local") {
    return "GeistMono";
  }

  if (["CY", "GR"].includes(invoice.taxCountryCode)) {
    return "NotoSansMonoGreek";
  }

  if (["BG", "BY", "MK", "RU", "UA"].includes(invoice.taxCountryCode)) {
    return "NotoSansMonoCyrillic";
  }

  if (invoice.taxCountryCode === "AM") {
    return "NotoSansArmenian";
  }

  if (invoice.taxCountryCode === "GE") {
    return "NotoSansGeorgian";
  }

  return "GeistMono";
};

export const InvoicePdf = ({ data }: InvoicePdfProps) => {
  const invoice = invoiceWithResolvedTotal(data);
  const taxCountry = getTaxCountry(invoice.taxCountryCode);
  const copy = getInvoiceCopy(invoice.taxCountryCode, invoice.languageMode);
  const subtotal = invoiceSubtotal(invoice);
  const taxRate = invoice.taxEnabled ? taxCountry.rate : 0;

  return (
    <Document
      author="Black Invoices"
      creator="Black Invoices"
      producer="Black Invoices"
      subject={`Invoice ${invoice.invoiceNo}`}
      title={`Invoice ${invoice.invoiceNo}`}
    >
      <Page
        size="A4"
        style={[styles.page, { fontFamily: invoiceFontFamily(invoice) }]}
      >
        <View style={styles.logo}>
          {!invoice.logoDataUrl ? (
            <Text style={styles.logoText}>{invoice.logoLetter || "L"}</Text>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <MetaItem label={copy.invoiceNo} value={invoice.invoiceNo} />
          <MetaItem
            label={copy.issueDate}
            value={formatDate(invoice.issueDate, invoice.taxCountryCode)}
          />
          <MetaItem
            align="right"
            label={copy.dueDate}
            value={formatDate(invoice.dueDate, invoice.taxCountryCode)}
          />
        </View>

        <View style={styles.fromBlock}>
          <PartyBlock
            taxIdLabel={copy.taxId}
            title={copy.from}
            party={invoice.from}
          />
        </View>
        <View style={styles.toBlock}>
          <PartyBlock
            taxIdLabel={copy.taxId}
            title={copy.to}
            party={invoice.to}
          />
        </View>

        <View style={styles.items}>
          <View style={styles.itemHeader}>
            <Text style={[styles.label, styles.itemName]}>{copy.item}</Text>
            <Text style={[styles.label, styles.itemQuantity]}>
              {copy.quantity}
            </Text>
            <Text style={[styles.label, styles.itemPrice]}>
              {copy.unitPrice}
            </Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.line, styles.itemName]}>
                {displayValue(item.item)}
              </Text>
              <Text style={[styles.line, styles.itemQuantity]}>
                {displayValue(item.quantity)}
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
            <Text style={styles.label}>{copy.subtotal}</Text>
            <Text style={styles.taxValue}>
              {formatCurrency(subtotal, {
                countryCode: invoice.taxCountryCode,
                decimals: 2,
              })}
            </Text>
          </View>
          <View style={styles.taxRow}>
            <Text style={styles.label}>
              {copy.taxName} {formatRate(taxRate)}
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
            <Text style={styles.label}>{copy.total}</Text>
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
          <Text style={styles.label}>{copy.paymentDetails}</Text>
          <Text style={styles.line}>
            {copy.beneficiary}: {displayValue(invoice.payment.beneficiary)}
          </Text>
          <Text style={styles.line}>
            {copy.bank}: {displayValue(invoice.payment.bank)}
          </Text>
          <Text style={styles.line}>
            IBAN: {displayValue(formatIban(invoice.payment.iban))}
          </Text>
          <Text style={styles.line}>
            BIC/SWIFT: {displayValue(invoice.payment.bic)}
          </Text>
          <Text style={styles.line}>
            {copy.reference}: {displayValue(invoice.payment.reference)}
          </Text>
          <Text style={styles.line}>{displayValue(invoice.payment.terms)}</Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.label}>{copy.note}</Text>
          <Text style={styles.line}>{displayValue(invoice.note)}</Text>
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
    fontFamily: "GeistMono",
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
