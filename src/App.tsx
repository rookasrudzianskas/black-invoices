"use client";

import {
  CalendarDays,
  Copy,
  Euro,
  Image as ImageIcon,
  Landmark,
  Plus,
  ReceiptText,
  RefreshCcw,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { InvoicePreview } from "./InvoicePreview";
import PdfDownloadButton from "./PdfDownloadButton";
import {
  defaultInvoice,
  EUROPEAN_TAX_COUNTRIES,
  formatCurrency,
  formatIban,
  formatRate,
  getTaxCountry,
  ibanHint,
  invoiceSubtotal,
  invoiceWithResolvedTotal,
  type InvoiceData,
  type LineItem,
  type Party,
  type PaymentDetails,
} from "./invoice";

type FieldProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "email" | "date" | "number";
  min?: string;
  step?: string;
  disabled?: boolean;
};

const fieldIcon = {
  invoice: ReceiptText,
  dates: CalendarDays,
  party: UserRound,
  payment: Landmark,
  currency: Euro,
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  min,
  step,
  disabled = false,
}: FieldProps) => (
  <label className="field">
    <span>{label}</span>
    <input
      min={min}
      step={step}
      type={type}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

const SelectField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="field">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {EUROPEAN_TAX_COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name} · {country.taxName} {formatRate(country.rate)}
        </option>
      ))}
    </select>
  </label>
);

const SectionTitle = ({
  icon,
  title,
}: {
  icon: keyof typeof fieldIcon;
  title: string;
}) => {
  const Icon = fieldIcon[icon];

  return (
    <div className="section-title">
      <Icon aria-hidden="true" size={16} />
      <h2>{title}</h2>
    </div>
  );
};

const createLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  item: "Product design",
  quantity: "1",
  price: 1400,
});

const MAX_LOGO_BYTES = 4 * 1024 * 1024;

export default function App() {
  const [invoice, setInvoice] = useState<InvoiceData>(defaultInvoice);
  const [logoError, setLogoError] = useState("");
  const pdfInvoice = useMemo(() => invoiceWithResolvedTotal(invoice), [invoice]);
  const subtotal = useMemo(() => invoiceSubtotal(invoice), [invoice]);
  const taxCountry = useMemo(
    () => getTaxCountry(invoice.taxCountryCode),
    [invoice.taxCountryCode],
  );
  const paymentHint = useMemo(
    () => ibanHint(invoice.payment.iban, invoice.taxCountryCode),
    [invoice.payment.iban, invoice.taxCountryCode],
  );

  const updateInvoice = <Key extends keyof InvoiceData>(
    key: Key,
    value: InvoiceData[Key],
  ) => {
    setInvoice((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateParty = (
    side: "from" | "to",
    key: keyof Party,
    value: string,
  ) => {
    setInvoice((current) => ({
      ...current,
      [side]: {
        ...current[side],
        [key]: value,
      },
    }));
  };

  const updatePayment = (key: keyof PaymentDetails, value: string) => {
    setInvoice((current) => ({
      ...current,
      payment: {
        ...current.payment,
        [key]: value,
      },
    }));
  };

  const updateItem = (
    itemId: string,
    key: keyof Omit<LineItem, "id">,
    value: string,
  ) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [key]: key === "price" ? Number(value) : value,
            }
          : item,
      ),
    }));
  };

  const removeItem = (itemId: string) => {
    setInvoice((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((item) => item.id !== itemId),
    }));
  };

  const addItem = () => {
    setInvoice((current) => ({
      ...current,
      items: [...current.items, createLineItem()],
    }));
  };

  const handleLogoUpload = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setLogoError("Use a PNG or JPG logo.");
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Keep the logo under 4 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const image = new window.Image();

      image.onload = () => {
        const maxSize = 512;
        const ratio = Math.min(
          maxSize / image.naturalWidth,
          maxSize / image.naturalHeight,
          1,
        );
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          setLogoError("That logo could not be prepared.");
          return;
        }

        canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        setLogoError("");
        setInvoice((current) => ({
          ...current,
          logoDataUrl: canvas.toDataURL("image/png"),
          logoFileName: file.name,
        }));
      };

      image.onerror = () => setLogoError("That logo could not be read.");
      image.src = result;
    };
    reader.onerror = () => setLogoError("That logo could not be read.");
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoError("");
    setInvoice((current) => ({
      ...current,
      logoDataUrl: "",
      logoFileName: "",
    }));
  };

  return (
    <main className="app-shell">
      <section className="control-panel" aria-label="Invoice editor">
        <header className="app-header">
          <div>
            <p className="eyebrow">BLACK INVOICES</p>
            <h1>Invoice generator</h1>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => {
              setLogoError("");
              setInvoice(defaultInvoice);
            }}
            aria-label="Reset invoice"
            title="Reset invoice"
          >
            <RefreshCcw size={17} aria-hidden="true" />
          </button>
        </header>

        <div className="summary-strip" aria-label="Invoice summary">
          <div>
            <span>Currency</span>
            <strong>EUR / €</strong>
          </div>
          <div>
            <span>
              {taxCountry.taxName} {formatRate(taxCountry.rate)}
            </span>
            <strong>
              {formatCurrency(pdfInvoice.salesTax, {
                countryCode: invoice.taxCountryCode,
                decimals: 2,
              })}
            </strong>
          </div>
          <div>
            <span>Total</span>
            <strong>
              {formatCurrency(pdfInvoice.total, {
                countryCode: invoice.taxCountryCode,
                decimals: 2,
              })}
            </strong>
          </div>
        </div>

        <div className="form-stack">
          <section className="form-section">
            <SectionTitle icon="invoice" title="Document" />
            <div className="logo-uploader">
              <div className="logo-swatch">
                {invoice.logoDataUrl ? (
                  <img alt="" src={invoice.logoDataUrl} />
                ) : (
                  <span>{invoice.logoLetter || "L"}</span>
                )}
              </div>
              <div className="logo-actions">
                <div className="logo-meta">
                  <ImageIcon size={15} aria-hidden="true" />
                  <span>Logo tile</span>
                </div>
                <label className="upload-button">
                  <Upload size={15} aria-hidden="true" />
                  Upload logo
                  <input
                    accept="image/png,image/jpeg"
                    type="file"
                    onChange={(event) => {
                      handleLogoUpload(event.currentTarget.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {invoice.logoDataUrl ? (
                  <button
                    className="text-button"
                    type="button"
                    onClick={clearLogo}
                    aria-label="Remove uploaded logo"
                    title="Remove uploaded logo"
                  >
                    <X size={14} aria-hidden="true" />
                    Remove
                  </button>
                ) : null}
                <p className={logoError ? "logo-error" : undefined}>
                  {logoError ||
                    invoice.logoFileName ||
                    "PNG or JPG, placed in the invoice mark."}
                </p>
              </div>
            </div>
            <div className="field-grid two">
              <Field
                label="Fallback mark"
                value={invoice.logoLetter}
                onChange={(value) =>
                  updateInvoice("logoLetter", value.slice(0, 1).toUpperCase())
                }
              />
              <Field
                label="Invoice No."
                value={invoice.invoiceNo}
                onChange={(value) =>
                  setInvoice((current) => ({
                    ...current,
                    invoiceNo: value,
                    payment: {
                      ...current.payment,
                      reference:
                        current.payment.reference === current.invoiceNo
                          ? value
                          : current.payment.reference,
                    },
                  }))
                }
              />
            </div>
            <div className="field-grid two">
              <Field
                label="Issue date"
                type="date"
                value={invoice.issueDate}
                onChange={(value) => updateInvoice("issueDate", value)}
              />
              <Field
                label="Due date"
                type="date"
                value={invoice.dueDate}
                onChange={(value) => updateInvoice("dueDate", value)}
              />
            </div>
            <div className="total-strip">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={invoice.autoTotal}
                  onChange={(event) =>
                    updateInvoice("autoTotal", event.target.checked)
                  }
                />
                <span aria-hidden="true" />
                Auto total
              </label>
              <Field
                label="Total (€)"
                type="number"
                min="0"
                step="0.01"
                value={pdfInvoice.total}
                disabled={invoice.autoTotal}
                onChange={(value) => updateInvoice("total", Number(value || 0))}
              />
            </div>
          </section>

          <section className="form-section">
            <SectionTitle icon="currency" title="VAT setup" />
            <SelectField
              label="Tax country"
              value={invoice.taxCountryCode}
              onChange={(value) => updateInvoice("taxCountryCode", value)}
            />
            <div className="currency-panel">
              <div>
                <span>Country</span>
                <strong>{taxCountry.name}</strong>
              </div>
              <div>
                <span>Rate</span>
                <strong>
                  {taxCountry.taxName} {formatRate(taxCountry.rate)}
                </strong>
              </div>
              <div>
                <span>Tax basis</span>
                <strong>
                  {formatCurrency(subtotal, {
                    countryCode: invoice.taxCountryCode,
                    decimals: 2,
                  })}
                </strong>
              </div>
              <div>
                <span>Tax</span>
                <strong>
                  {formatCurrency(pdfInvoice.salesTax, {
                    countryCode: invoice.taxCountryCode,
                    decimals: 2,
                  })}
                </strong>
              </div>
              <div>
                <span>Payment rail</span>
                <strong>{taxCountry.paymentRail}</strong>
              </div>
              <div>
                <span>IBAN format</span>
                <strong>
                  {taxCountry.ibanLength
                    ? `${taxCountry.code} · ${taxCountry.ibanLength} chars`
                    : "Local + SWIFT"}
                </strong>
              </div>
              <div>
                <span>Tax ID label</span>
                <strong>{taxCountry.taxIdLabel}</strong>
              </div>
            </div>
          </section>

          <section className="form-section">
            <SectionTitle icon="party" title="From" />
            <PartyFields
              taxIdLabel={taxCountry.taxIdLabel}
              party={invoice.from}
              onChange={(key, value) => updateParty("from", key, value)}
            />
          </section>

          <section className="form-section">
            <SectionTitle icon="party" title="To" />
            <PartyFields
              taxIdLabel={taxCountry.taxIdLabel}
              party={invoice.to}
              onChange={(key, value) => updateParty("to", key, value)}
            />
          </section>

          <section className="form-section">
            <div className="section-title with-action">
              <div>
                <Copy aria-hidden="true" size={16} />
                <h2>Line items</h2>
              </div>
              <button
                className="mini-button"
                type="button"
                onClick={addItem}
                aria-label="Add line item"
                title="Add line item"
              >
                <Plus size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="line-item-stack">
              {invoice.items.map((item) => (
                <div className="line-item" key={item.id}>
                  <Field
                    label="Item"
                    value={item.item}
                    onChange={(value) => updateItem(item.id, "item", value)}
                  />
                  <Field
                    label="Qty"
                    value={item.quantity}
                    onChange={(value) =>
                      updateItem(item.id, "quantity", value)
                    }
                  />
                  <Field
                    label="Unit price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(value) => updateItem(item.id, "price", value)}
                  />
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove line item"
                    title="Remove line item"
                    disabled={invoice.items.length === 1}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="form-section">
            <SectionTitle icon="payment" title="Payment" />
            <div className="field-grid two">
              <Field
                label="Beneficiary"
                value={invoice.payment.beneficiary}
                onChange={(value) => updatePayment("beneficiary", value)}
              />
              <Field
                label="Bank"
                value={invoice.payment.bank}
                onChange={(value) => updatePayment("bank", value)}
              />
            </div>
            <div className="field-grid two">
              <Field
                label="BIC / SWIFT"
                value={invoice.payment.bic}
                onChange={(value) =>
                  updatePayment("bic", value.toUpperCase().replace(/\s/g, ""))
                }
              />
              <Field
                label="Payment reference"
                value={invoice.payment.reference}
                onChange={(value) => updatePayment("reference", value)}
              />
            </div>
            <Field
              label="IBAN"
              value={invoice.payment.iban}
              onChange={(value) => updatePayment("iban", formatIban(value))}
            />
            <div className="payment-advisory">
              <span>{taxCountry.paymentRail}</span>
              <strong>{paymentHint}</strong>
            </div>
            <Field
              label="Payment terms"
              value={invoice.payment.terms}
              onChange={(value) => updatePayment("terms", value)}
            />
            <label className="field">
              <span>Note</span>
              <textarea
                value={invoice.note}
                onChange={(event) => updateInvoice("note", event.target.value)}
              />
            </label>
          </section>
        </div>
      </section>

      <section className="preview-panel" aria-label="Invoice preview">
        <div className="preview-toolbar">
          <div>
            <p className="eyebrow">A4 / Geist Mono / EUR</p>
            <h2>{invoice.invoiceNo || "Untitled invoice"}</h2>
          </div>
          <PdfDownloadButton data={pdfInvoice} />
        </div>

        <InvoicePreview data={invoice} />
      </section>
    </main>
  );
}

const PartyFields = ({
  party,
  taxIdLabel,
  onChange,
}: {
  party: Party;
  taxIdLabel: string;
  onChange: (key: keyof Party, value: string) => void;
}) => (
  <>
    <div className="field-grid two">
      <Field
        label="Name"
        value={party.name}
        onChange={(value) => onChange("name", value)}
      />
      <Field
        label="Email"
        type="email"
        value={party.email}
        onChange={(value) => onChange("email", value)}
      />
    </div>
    <div className="field-grid two">
      <Field
        label="Phone"
        value={party.phone}
        onChange={(value) => onChange("phone", value)}
      />
      <Field
        label={taxIdLabel}
        value={party.vatId}
        onChange={(value) => onChange("vatId", value)}
      />
    </div>
    <Field
      label="Street"
      value={party.address}
      onChange={(value) => onChange("address", value)}
    />
    <Field
      label="City / country"
      value={party.cityLine}
      onChange={(value) => onChange("cityLine", value)}
    />
  </>
);
