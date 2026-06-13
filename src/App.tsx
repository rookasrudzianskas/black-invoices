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
  addDaysToInputDate,
  bicCheck,
  countryDisplayName,
  createDefaultInvoice,
  DUE_DATE_PRESETS,
  duePresetLabel,
  EUROPEAN_TAX_COUNTRIES,
  formatBicValidation,
  formatCurrency,
  formatIban,
  formatIbanValidation,
  formatRate,
  getAppCopy,
  getInvoiceCopy,
  getTaxCountry,
  ibanCheck,
  invoiceWithCountryExamples,
  invoiceSubtotal,
  invoiceWithResolvedTotal,
  lineItemAmount,
  normalizeBic,
  paymentTermsForDueDate,
  paymentRailLabel,
  type AppCopy,
  type InvoiceData,
  type InvoiceLanguageMode,
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
  placeholder?: string;
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
  placeholder,
}: FieldProps) => (
  <label className="field">
    <span>{label}</span>
    <input
      min={min}
      placeholder={placeholder}
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
  displayCountryCode,
  languageMode,
  onChange,
}: {
  displayCountryCode: string;
  label: string;
  languageMode: InvoiceLanguageMode;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="field">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {EUROPEAN_TAX_COUNTRIES.map((country) => {
        const optionCopy = getInvoiceCopy(country.code, languageMode);

        return (
          <option key={country.code} value={country.code}>
            {countryDisplayName(country.code, displayCountryCode, languageMode)} ·{" "}
            {optionCopy.taxName} {formatRate(country.rate)}
          </option>
        );
      })}
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
  const [invoice, setInvoice] = useState<InvoiceData>(() =>
    createDefaultInvoice(),
  );
  const [logoError, setLogoError] = useState("");
  const pdfInvoice = useMemo(() => invoiceWithResolvedTotal(invoice), [invoice]);
  const subtotal = useMemo(() => invoiceSubtotal(invoice), [invoice]);
  const taxCountry = useMemo(
    () => getTaxCountry(invoice.taxCountryCode),
    [invoice.taxCountryCode],
  );
  const invoiceCopy = useMemo(
    () => getInvoiceCopy(invoice.taxCountryCode, invoice.languageMode),
    [invoice.languageMode, invoice.taxCountryCode],
  );
  const appCopy = useMemo(
    () => getAppCopy(invoice.taxCountryCode, invoice.languageMode),
    [invoice.languageMode, invoice.taxCountryCode],
  );
  const currentCountryName = useMemo(
    () =>
      countryDisplayName(
        invoice.taxCountryCode,
        invoice.taxCountryCode,
        invoice.languageMode,
      ),
    [invoice.languageMode, invoice.taxCountryCode],
  );
  const ibanValidation = useMemo(
    () => ibanCheck(invoice.payment.iban, invoice.taxCountryCode),
    [invoice.payment.iban, invoice.taxCountryCode],
  );
  const bicValidation = useMemo(
    () => bicCheck(invoice.payment.bic),
    [invoice.payment.bic],
  );
  const ibanValidationMessage = useMemo(
    () =>
      formatIbanValidation(
        ibanValidation,
        invoice.taxCountryCode,
        invoice.languageMode,
      ),
    [ibanValidation, invoice.languageMode, invoice.taxCountryCode],
  );
  const bicValidationMessage = useMemo(
    () =>
      formatBicValidation(
        bicValidation,
        invoice.taxCountryCode,
        invoice.languageMode,
      ),
    [bicValidation, invoice.languageMode, invoice.taxCountryCode],
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

  const updateLanguageMode = (mode: InvoiceLanguageMode) => {
    setInvoice((current) => {
      const previousTerms = paymentTermsForDueDate(
        current.dueDate,
        current.taxCountryCode,
        current.languageMode,
      );
      const nextTerms = paymentTermsForDueDate(
        current.dueDate,
        current.taxCountryCode,
        mode,
      );

      return {
        ...current,
        languageMode: mode,
        payment: {
          ...current.payment,
          terms:
            current.payment.terms === previousTerms
              ? nextTerms
              : current.payment.terms,
        },
      };
    });
  };

  const updateTaxCountry = (countryCode: string) => {
    setInvoice((current) => invoiceWithCountryExamples(current, countryCode));
  };

  const applyDuePreset = (days: number) => {
    setInvoice((current) => {
      const issueDate = current.issueDate || addDaysToInputDate("", 0);
      const dueDate = addDaysToInputDate(issueDate, days);

      return {
        ...current,
        dueDate,
        payment: {
          ...current.payment,
          terms: paymentTermsForDueDate(
            dueDate,
            current.taxCountryCode,
            current.languageMode,
          ),
        },
      };
    });
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
      setLogoError(appCopy.logoTypeError);
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setLogoError(appCopy.logoSizeError);
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
          setLogoError(appCopy.logoPrepError);
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

      image.onerror = () => setLogoError(appCopy.logoReadError);
      image.src = result;
    };
    reader.onerror = () => setLogoError(appCopy.logoReadError);
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
    <main
      className="app-shell"
      lang={invoice.languageMode === "local" ? taxCountry.locale : "en"}
    >
      <section className="control-panel" aria-label={appCopy.invoiceEditor}>
        <header className="app-header">
          <div>
            <p className="eyebrow">BLACK INVOICES</p>
            <h1>{appCopy.generatorTitle}</h1>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => {
              setLogoError("");
              setInvoice(createDefaultInvoice());
            }}
            aria-label={appCopy.resetInvoice}
            title={appCopy.resetInvoice}
          >
            <RefreshCcw size={17} aria-hidden="true" />
          </button>
        </header>

        <div className="summary-strip" aria-label={appCopy.invoiceSummary}>
          <div>
            <span>{appCopy.currency}</span>
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
            <span>{invoiceCopy.total}</span>
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
            <SectionTitle icon="invoice" title={appCopy.document} />
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
                  <span>{appCopy.logoTile}</span>
                </div>
                <label className="upload-button">
                  <Upload size={15} aria-hidden="true" />
                  {appCopy.uploadLogo}
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
                    aria-label={appCopy.removeUploadedLogo}
                    title={appCopy.removeUploadedLogo}
                  >
                    <X size={14} aria-hidden="true" />
                    {appCopy.remove}
                  </button>
                ) : null}
                <p className={logoError ? "logo-error" : undefined}>
                  {logoError ||
                    invoice.logoFileName ||
                    appCopy.logoHint}
                </p>
              </div>
            </div>
            <div className="field-grid two">
              <Field
                label={appCopy.fallbackMark}
                value={invoice.logoLetter}
                placeholder="L"
                onChange={(value) =>
                  updateInvoice("logoLetter", value.slice(0, 1).toUpperCase())
                }
              />
              <Field
                label={invoiceCopy.invoiceNo}
                value={invoice.invoiceNo}
                placeholder="INV-2026-001"
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
                label={invoiceCopy.issueDate}
                type="date"
                value={invoice.issueDate}
                onChange={(value) => updateInvoice("issueDate", value)}
              />
              <Field
                label={invoiceCopy.dueDate}
                type="date"
                value={invoice.dueDate}
                onChange={(value) => updateInvoice("dueDate", value)}
              />
            </div>
            <div className="due-presets" aria-label={appCopy.dueDateShortcuts}>
              {DUE_DATE_PRESETS.map((preset) => {
                const expectedDate = addDaysToInputDate(
                  invoice.issueDate || addDaysToInputDate("", 0),
                  preset.days,
                );

                return (
                  <button
                    className={invoice.dueDate === expectedDate ? "active" : ""}
                    key={preset.days}
                    type="button"
                    onClick={() => applyDuePreset(preset.days)}
                    aria-pressed={invoice.dueDate === expectedDate}
                  >
                    {duePresetLabel(
                      preset.days,
                      invoice.taxCountryCode,
                      invoice.languageMode,
                    )}
                  </button>
                );
              })}
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
                {appCopy.autoTotal}
              </label>
              <Field
                label={appCopy.totalEuro}
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
            <SectionTitle icon="currency" title={appCopy.vatSetup} />
            <SelectField
              displayCountryCode={invoice.taxCountryCode}
              label={appCopy.taxCountry}
              languageMode={invoice.languageMode}
              value={invoice.taxCountryCode}
              onChange={updateTaxCountry}
            />
            <div
              className="language-toggle"
              role="group"
              aria-label={appCopy.invoiceLanguage}
            >
              <button
                className={invoice.languageMode === "english" ? "active" : ""}
                type="button"
                aria-pressed={invoice.languageMode === "english"}
                onClick={() => updateLanguageMode("english")}
              >
                {appCopy.englishInvoice}
              </button>
              <button
                className={invoice.languageMode === "local" ? "active" : ""}
                type="button"
                aria-pressed={invoice.languageMode === "local"}
                onClick={() => updateLanguageMode("local")}
              >
                {appCopy.localInvoice(taxCountry.localLanguageName)}
              </button>
            </div>
            <div className="currency-panel">
              <div>
                <span>{appCopy.country}</span>
                <strong>{currentCountryName}</strong>
              </div>
              <div>
                <span>{appCopy.rate}</span>
                <strong>
                  {invoiceCopy.taxName} {formatRate(taxCountry.rate)}
                </strong>
              </div>
              <div>
                <span>{appCopy.taxBasis}</span>
                <strong>
                  {formatCurrency(subtotal, {
                    countryCode: invoice.taxCountryCode,
                    decimals: 2,
                  })}
                </strong>
              </div>
              <div>
                <span>{appCopy.tax}</span>
                <strong>
                  {formatCurrency(pdfInvoice.salesTax, {
                    countryCode: invoice.taxCountryCode,
                    decimals: 2,
                  })}
                </strong>
              </div>
              <div>
                <span>{appCopy.paymentRail}</span>
                <strong>
                  {paymentRailLabel(invoice.taxCountryCode, invoice.languageMode)}
                </strong>
              </div>
              <div>
                <span>{appCopy.ibanFormat}</span>
                <strong>
                  {taxCountry.ibanLength
                    ? `${taxCountry.code} · ${appCopy.ibanChars(
                        taxCountry.ibanLength,
                      )}`
                    : appCopy.localSwift}
                </strong>
              </div>
              <div>
                <span>{appCopy.taxIdLabel}</span>
                <strong>{invoiceCopy.taxId}</strong>
              </div>
              <div>
                <span>{appCopy.invoiceLanguage}</span>
                <strong>
                  {invoice.languageMode === "english"
                    ? appCopy.english
                    : taxCountry.localLanguageName}
                </strong>
              </div>
            </div>
          </section>

          <section className="form-section">
            <SectionTitle icon="party" title={invoiceCopy.from} />
            <PartyFields
              appCopy={appCopy}
              taxIdLabel={invoiceCopy.taxId}
              party={invoice.from}
              placeholders={taxCountry.examples.from}
              onChange={(key, value) => updateParty("from", key, value)}
            />
          </section>

          <section className="form-section">
            <SectionTitle icon="party" title={invoiceCopy.to} />
            <PartyFields
              appCopy={appCopy}
              taxIdLabel={invoiceCopy.taxId}
              party={invoice.to}
              placeholders={taxCountry.examples.to}
              onChange={(key, value) => updateParty("to", key, value)}
            />
          </section>

          <section className="form-section">
            <div className="section-title with-action">
              <div>
                <Copy aria-hidden="true" size={16} />
                <h2>{appCopy.lineItems}</h2>
              </div>
              <button
                className="mini-button"
                type="button"
                onClick={addItem}
                aria-label={appCopy.addLineItem}
                title={appCopy.addLineItem}
              >
                <Plus size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="line-item-stack">
              {invoice.items.map((item) => (
                <div className="line-item" key={item.id}>
                  <Field
                    label={invoiceCopy.item}
                    value={item.item}
                    placeholder={taxCountry.examples.item.item}
                    onChange={(value) => updateItem(item.id, "item", value)}
                  />
                  <Field
                    label={invoiceCopy.quantity}
                    value={item.quantity}
                    placeholder={taxCountry.examples.item.quantity}
                    onChange={(value) =>
                      updateItem(item.id, "quantity", value)
                    }
                  />
                  <Field
                    label={invoiceCopy.unitPrice}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    placeholder={`${taxCountry.examples.item.price}`}
                    onChange={(value) => updateItem(item.id, "price", value)}
                  />
                  <div className="line-amount">
                    <span>{appCopy.amount}</span>
                    <strong>
                      {formatCurrency(lineItemAmount(item), {
                        countryCode: invoice.taxCountryCode,
                        decimals: 2,
                      })}
                    </strong>
                  </div>
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={appCopy.remove}
                    title={appCopy.remove}
                    disabled={invoice.items.length === 1}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="form-section">
            <SectionTitle icon="payment" title={appCopy.payment} />
            <div className="field-grid two">
              <Field
                label={invoiceCopy.beneficiary}
                value={invoice.payment.beneficiary}
                placeholder={taxCountry.examples.payment.beneficiary}
                onChange={(value) => updatePayment("beneficiary", value)}
              />
              <Field
                label={invoiceCopy.bank}
                value={invoice.payment.bank}
                placeholder={taxCountry.examples.payment.bank}
                onChange={(value) => updatePayment("bank", value)}
              />
            </div>
            <div className="field-grid two">
              <Field
                label={appCopy.bicSwift}
                value={invoice.payment.bic}
                placeholder={taxCountry.examples.payment.bic}
                onChange={(value) =>
                  updatePayment("bic", normalizeBic(value))
                }
              />
              <Field
                label={appCopy.paymentReference}
                value={invoice.payment.reference}
                placeholder={invoice.invoiceNo}
                onChange={(value) => updatePayment("reference", value)}
              />
            </div>
            <Field
              label="IBAN"
              value={invoice.payment.iban}
              placeholder={taxCountry.examples.payment.iban}
              onChange={(value) => updatePayment("iban", formatIban(value))}
            />
            <div className={`payment-advisory ${ibanValidation.tone}`}>
              <span>
                {paymentRailLabel(invoice.taxCountryCode, invoice.languageMode)}
              </span>
              <strong>{ibanValidationMessage}</strong>
              <strong>{bicValidationMessage}</strong>
            </div>
            <Field
              label={appCopy.paymentTerms}
              value={invoice.payment.terms}
              placeholder={paymentTermsForDueDate(
                invoice.dueDate,
                invoice.taxCountryCode,
                invoice.languageMode,
              )}
              onChange={(value) => updatePayment("terms", value)}
            />
            <label className="field">
              <span>{invoiceCopy.note}</span>
              <textarea
                value={invoice.note}
                placeholder={taxCountry.examples.note}
                onChange={(event) => updateInvoice("note", event.target.value)}
              />
            </label>
          </section>
        </div>
      </section>

      <section className="preview-panel" aria-label={appCopy.invoicePreview}>
        <div className="preview-toolbar">
          <div>
            <p className="eyebrow">{appCopy.previewTech}</p>
            <h2>{invoice.invoiceNo || appCopy.untitledInvoice}</h2>
          </div>
          <PdfDownloadButton
            data={pdfInvoice}
            downloadLabel={appCopy.downloadPdf}
            renderingLabel={appCopy.rendering}
          />
        </div>

        <InvoicePreview data={invoice} />
      </section>
    </main>
  );
}

const PartyFields = ({
  appCopy,
  party,
  placeholders,
  taxIdLabel,
  onChange,
}: {
  appCopy: AppCopy;
  party: Party;
  placeholders: Party;
  taxIdLabel: string;
  onChange: (key: keyof Party, value: string) => void;
}) => (
  <>
    <div className="field-grid two">
      <Field
        label={appCopy.name}
        value={party.name}
        placeholder={placeholders.name}
        onChange={(value) => onChange("name", value)}
      />
      <Field
        label={appCopy.email}
        type="email"
        value={party.email}
        placeholder={placeholders.email}
        onChange={(value) => onChange("email", value)}
      />
    </div>
    <div className="field-grid two">
      <Field
        label={appCopy.phone}
        value={party.phone}
        placeholder={placeholders.phone}
        onChange={(value) => onChange("phone", value)}
      />
      <Field
        label={taxIdLabel}
        value={party.vatId}
        placeholder={placeholders.vatId}
        onChange={(value) => onChange("vatId", value)}
      />
    </div>
    <Field
      label={appCopy.street}
      value={party.address}
      placeholder={placeholders.address}
      onChange={(value) => onChange("address", value)}
    />
    <Field
      label={appCopy.cityCountry}
      value={party.cityLine}
      placeholder={placeholders.cityLine}
      onChange={(value) => onChange("cityLine", value)}
    />
  </>
);
