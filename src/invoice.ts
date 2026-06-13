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
  beneficiary: string;
  bank: string;
  iban: string;
  bic: string;
  reference: string;
  terms: string;
};

export type TaxCountry = {
  code: string;
  name: string;
  rate: number;
  taxName: string;
  locale: string;
  taxIdLabel: string;
  ibanLength: number | null;
  paymentRail: string;
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

type BaseTaxCountry = Pick<TaxCountry, "code" | "name" | "rate" | "taxName">;

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
    beneficiary: "Lost island AB",
    bank: "SEB",
    iban: "SE45 5000 0000 0583 9825 7466",
    bic: "ESSESESS",
    reference: "INV-01",
    terms: "Due in 7 days",
  },
  note: "Thanks for great collaboration",
};

const EUROPEAN_IBAN_LENGTHS: Record<string, number> = {
  AD: 24,
  AL: 28,
  AM: 28,
  AT: 20,
  AZ: 28,
  BA: 20,
  BE: 16,
  BG: 22,
  BY: 28,
  CH: 21,
  CY: 28,
  CZ: 24,
  DE: 22,
  DK: 18,
  EE: 20,
  ES: 24,
  FI: 18,
  FR: 27,
  GB: 22,
  GE: 22,
  GR: 27,
  HR: 21,
  HU: 28,
  IE: 22,
  IS: 26,
  IT: 27,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  MC: 27,
  MD: 24,
  ME: 22,
  MK: 19,
  MT: 31,
  NL: 18,
  NO: 15,
  PL: 28,
  PT: 25,
  RO: 24,
  RS: 22,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  TR: 26,
  UA: 29,
  VA: 22,
  XK: 20,
};

const EUROPEAN_LOCALES: Record<string, string> = {
  AD: "ca-AD",
  AL: "sq-AL",
  AM: "hy-AM",
  AT: "de-AT",
  AZ: "az-AZ",
  BA: "bs-BA",
  BE: "nl-BE",
  BG: "bg-BG",
  BY: "be-BY",
  CH: "de-CH",
  CY: "el-CY",
  CZ: "cs-CZ",
  DE: "de-DE",
  DK: "da-DK",
  EE: "et-EE",
  ES: "es-ES",
  FI: "fi-FI",
  FR: "fr-FR",
  GB: "en-GB",
  GE: "ka-GE",
  GR: "el-GR",
  HR: "hr-HR",
  HU: "hu-HU",
  IE: "en-IE",
  IS: "is-IS",
  IT: "it-IT",
  LI: "de-LI",
  LT: "lt-LT",
  LU: "fr-LU",
  LV: "lv-LV",
  MC: "fr-MC",
  MD: "ro-MD",
  ME: "sr-ME",
  MK: "mk-MK",
  MT: "mt-MT",
  NL: "nl-NL",
  NO: "nb-NO",
  PL: "pl-PL",
  PT: "pt-PT",
  RO: "ro-RO",
  RS: "sr-RS",
  RU: "ru-RU",
  SE: "sv-SE",
  SI: "sl-SI",
  SK: "sk-SK",
  SM: "it-SM",
  TR: "tr-TR",
  UA: "uk-UA",
  VA: "it-VA",
  XK: "sq-XK",
};

const SEPA_COUNTRY_CODES = new Set([
  "AD",
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
  "SM",
  "VA",
]);

const BASE_TAX_COUNTRIES: BaseTaxCountry[] = [
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

export const EUROPEAN_TAX_COUNTRIES: TaxCountry[] = BASE_TAX_COUNTRIES.map(
  (country) => ({
    ...country,
    locale: EUROPEAN_LOCALES[country.code] ?? "en-IE",
    taxIdLabel: country.taxName === "IGI" ? "IGI ID" : "VAT ID",
    ibanLength: EUROPEAN_IBAN_LENGTHS[country.code] ?? null,
    paymentRail: SEPA_COUNTRY_CODES.has(country.code)
      ? "SEPA credit transfer"
      : country.code === "RU"
        ? "Local bank / SWIFT transfer"
        : "IBAN + SWIFT transfer",
  }),
);

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

export const normalizeIban = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const formatIban = (value: string) =>
  normalizeIban(value).replace(/(.{4})/g, "$1 ").trim();

export const ibanHint = (value: string, countryCode: string) => {
  const country = getTaxCountry(countryCode);
  const iban = normalizeIban(value);

  if (!country.ibanLength) {
    return "IBAN is not registered for this country; use local bank details plus SWIFT/BIC.";
  }

  if (!iban) {
    return `${country.name} IBANs are ${country.ibanLength} characters.`;
  }

  if (!iban.startsWith(country.code)) {
    return `Expected an IBAN starting with ${country.code}.`;
  }

  if (iban.length !== country.ibanLength) {
    return `${country.name} IBANs are ${country.ibanLength} characters; this one has ${iban.length}.`;
  }

  return `${country.name} IBAN format looks right.`;
};

export const formatDate = (value: string, countryCode?: string) => {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    countryCode ? getTaxCountry(countryCode).locale : "en-IE",
    {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
      year: "numeric",
    },
  )
    .format(date)
    .replace(/\u00a0/g, " ");
};

export const formatCurrency = (
  value: number,
  options: { countryCode?: string; decimals?: number; grouped?: boolean } = {},
) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const decimals = options.decimals ?? 0;
  const grouped = options.grouped ?? true;
  const locale = options.countryCode
    ? getTaxCountry(options.countryCode).locale
    : "en-IE";

  return new Intl.NumberFormat(locale, {
    currency: "EUR",
    currencyDisplay: "symbol",
    style: "currency",
    useGrouping: grouped,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(safeValue)
    .replace(/\u00a0/g, " ");
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
