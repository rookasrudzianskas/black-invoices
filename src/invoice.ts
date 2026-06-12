export type Party = {
  name: string;
  email: string;
  phone: string;
  address: string;
  cityLine: string;
  vatId: string;
};

export type LineItem = {
  id: string;
  item: string;
  quantity: string;
  price: number;
};

export type PaymentDetails = {
  bank: string;
  accountNumber: string;
  iban: string;
};

export type TaxCountry = {
  code: string;
  name: string;
  rate: number;
  taxName: string;
};

export type InvoiceData = {
  logoLetter: string;
  logoDataUrl: string;
  logoFileName: string;
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  taxCountryCode: string;
  from: Party;
  to: Party;
  items: LineItem[];
  salesTax: number;
  total: number;
  autoTotal: boolean;
  payment: PaymentDetails;
  note: string;
};

export const defaultInvoice: InvoiceData = {
  logoLetter: "L",
  logoDataUrl: "",
  logoFileName: "",
  invoiceNo: "INV-01",
  issueDate: "2024-08-12",
  dueDate: "2024-08-12",
  taxCountryCode: "SE",
  from: {
    name: "Lost island AB",
    email: "Pontus@lostisland.com",
    phone: "36182-4441",
    address: "Roslagsgatan 48",
    cityLine: "211 34 Stockholm, Sweden",
    vatId: "SE1246767676020",
  },
  to: {
    name: "Acme inc",
    email: "John.doe@acme.com",
    phone: "36182-4441",
    address: "Street 56",
    cityLine: "243 21 California, USA",
    vatId: "SE1246767676020",
  },
  items: [
    {
      id: "line-1",
      item: "Product design",
      quantity: "145",
      price: 1400,
    },
  ],
  salesTax: 0,
  total: 0,
  autoTotal: true,
  payment: {
    bank: "Chase",
    accountNumber: "085629563",
    iban: "0515113134346131313",
  },
  note: "Thanks for great collaboration",
};

export const EUROPEAN_TAX_COUNTRIES: TaxCountry[] = [
  { code: "AL", name: "Albania", rate: 20, taxName: "VAT" },
  { code: "AD", name: "Andorra", rate: 4.5, taxName: "IGI" },
  { code: "AM", name: "Armenia", rate: 20, taxName: "VAT" },
  { code: "AT", name: "Austria", rate: 20, taxName: "VAT" },
  { code: "AZ", name: "Azerbaijan", rate: 18, taxName: "VAT" },
  { code: "BY", name: "Belarus", rate: 20, taxName: "VAT" },
  { code: "BE", name: "Belgium", rate: 21, taxName: "VAT" },
  { code: "BA", name: "Bosnia and Herzegovina", rate: 17, taxName: "VAT" },
  { code: "BG", name: "Bulgaria", rate: 20, taxName: "VAT" },
  { code: "HR", name: "Croatia", rate: 25, taxName: "VAT" },
  { code: "CY", name: "Cyprus", rate: 19, taxName: "VAT" },
  { code: "CZ", name: "Czechia", rate: 21, taxName: "VAT" },
  { code: "DK", name: "Denmark", rate: 25, taxName: "VAT" },
  { code: "EE", name: "Estonia", rate: 24, taxName: "VAT" },
  { code: "FI", name: "Finland", rate: 25.5, taxName: "VAT" },
  { code: "FR", name: "France", rate: 20, taxName: "VAT" },
  { code: "GE", name: "Georgia", rate: 18, taxName: "VAT" },
  { code: "DE", name: "Germany", rate: 19, taxName: "VAT" },
  { code: "GR", name: "Greece", rate: 24, taxName: "VAT" },
  { code: "HU", name: "Hungary", rate: 27, taxName: "VAT" },
  { code: "IS", name: "Iceland", rate: 24, taxName: "VAT" },
  { code: "IE", name: "Ireland", rate: 23, taxName: "VAT" },
  { code: "IT", name: "Italy", rate: 22, taxName: "VAT" },
  { code: "XK", name: "Kosovo", rate: 18, taxName: "VAT" },
  { code: "LV", name: "Latvia", rate: 21, taxName: "VAT" },
  { code: "LI", name: "Liechtenstein", rate: 8.1, taxName: "VAT" },
  { code: "LT", name: "Lithuania", rate: 21, taxName: "VAT" },
  { code: "LU", name: "Luxembourg", rate: 17, taxName: "VAT" },
  { code: "MT", name: "Malta", rate: 18, taxName: "VAT" },
  { code: "MD", name: "Moldova", rate: 20, taxName: "VAT" },
  { code: "MC", name: "Monaco", rate: 20, taxName: "VAT" },
  { code: "ME", name: "Montenegro", rate: 21, taxName: "VAT" },
  { code: "NL", name: "Netherlands", rate: 21, taxName: "VAT" },
  { code: "MK", name: "North Macedonia", rate: 18, taxName: "VAT" },
  { code: "NO", name: "Norway", rate: 25, taxName: "VAT" },
  { code: "PL", name: "Poland", rate: 23, taxName: "VAT" },
  { code: "PT", name: "Portugal", rate: 23, taxName: "VAT" },
  { code: "RO", name: "Romania", rate: 21, taxName: "VAT" },
  { code: "RU", name: "Russia", rate: 20, taxName: "VAT" },
  { code: "SM", name: "San Marino", rate: 17, taxName: "VAT" },
  { code: "RS", name: "Serbia", rate: 20, taxName: "VAT" },
  { code: "SK", name: "Slovakia", rate: 23, taxName: "VAT" },
  { code: "SI", name: "Slovenia", rate: 22, taxName: "VAT" },
  { code: "ES", name: "Spain", rate: 21, taxName: "VAT" },
  { code: "SE", name: "Sweden", rate: 25, taxName: "VAT" },
  { code: "CH", name: "Switzerland", rate: 8.1, taxName: "VAT" },
  { code: "TR", name: "Turkey", rate: 20, taxName: "VAT" },
  { code: "UA", name: "Ukraine", rate: 20, taxName: "VAT" },
  { code: "GB", name: "United Kingdom", rate: 20, taxName: "VAT" },
  { code: "VA", name: "Vatican City", rate: 0, taxName: "VAT" },
];

export const getTaxCountry = (code: string) =>
  EUROPEAN_TAX_COUNTRIES.find((country) => country.code === code) ??
  EUROPEAN_TAX_COUNTRIES.find((country) => country.code === "SE")!;

export const formatRate = (rate: number) =>
  Number.isInteger(rate) ? `${rate}%` : `${rate.toFixed(1)}%`;

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const invoiceWithResolvedTotal = (invoice: InvoiceData): InvoiceData => {
  const subtotal = invoiceSubtotal(invoice);
  const country = getTaxCountry(invoice.taxCountryCode);
  const salesTax = roundMoney(subtotal * (country.rate / 100));

  return {
    ...invoice,
    salesTax,
    total: invoice.autoTotal ? roundMoney(subtotal + salesTax) : invoice.total,
  };
};

export const invoiceSubtotal = (invoice: InvoiceData) =>
  invoice.items.reduce((sum, item) => {
    const quantity = Number.parseFloat(item.quantity);
    const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
    return sum + safeQuantity * item.price;
  }, 0);

export const formatDate = (value: string) => {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${month}/${day}/${year}`;
};

export const formatCurrency = (
  value: number,
  options: { decimals?: number; grouped?: boolean } = {},
) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const decimals = options.decimals ?? 0;
  const grouped = options.grouped ?? true;
  const number = safeValue.toLocaleString("en-US", {
    useGrouping: grouped,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `€${number}`;
};

export const safeFileName = (invoiceNo: string) => {
  const fallback = "black-invoice";
  const clean = invoiceNo
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${clean || fallback}.pdf`;
};
