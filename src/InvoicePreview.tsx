import { useEffect, useMemo, useRef, useState } from "react";
import {
  displayValue,
  formatCurrency,
  formatDate,
  formatIban,
  formatRate,
  getAppCopy,
  getInvoiceCopy,
  getTaxCountry,
  invoiceSubtotal,
  invoiceWithResolvedTotal,
  type InvoiceData,
  type Party,
} from "./invoice";

type InvoicePreviewProps = {
  data: InvoiceData;
};

const BASE_WIDTH = 595;
const BASE_HEIGHT = 842;

const PartyPreview = ({
  title,
  party,
  taxIdLabel,
}: {
  title: string;
  party: Party;
  taxIdLabel: string;
}) => (
  <div className="preview-party">
    <div className="preview-muted preview-heading">{title}</div>
    <div>{displayValue(party.name)}</div>
    <div>{displayValue(party.email)}</div>
    <div>{displayValue(party.phone)}</div>
    <div>{displayValue(party.address)}</div>
    <div>{displayValue(party.cityLine)}</div>
    <div>
      {taxIdLabel}: {displayValue(party.vatId)}
    </div>
  </div>
);

export const InvoicePreview = ({ data }: InvoicePreviewProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const invoice = useMemo(() => invoiceWithResolvedTotal(data), [data]);
  const taxCountry = useMemo(
    () => getTaxCountry(invoice.taxCountryCode),
    [invoice.taxCountryCode],
  );
  const copy = useMemo(
    () => getInvoiceCopy(invoice.taxCountryCode, invoice.languageMode),
    [invoice.languageMode, invoice.taxCountryCode],
  );
  const appCopy = useMemo(
    () => getAppCopy(invoice.taxCountryCode, invoice.languageMode),
    [invoice.languageMode, invoice.taxCountryCode],
  );
  const subtotal = useMemo(() => invoiceSubtotal(invoice), [invoice]);
  const taxRate = invoice.taxEnabled ? taxCountry.rate : 0;

  useEffect(() => {
    const element = hostRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setScale(Math.min(width / BASE_WIDTH, 1));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="preview-host" ref={hostRef}>
      <div
        className="preview-stage"
        style={{
          height: BASE_HEIGHT * scale,
          ["--preview-scale" as string]: scale,
        }}
      >
        <div className="invoice-paper" aria-label={appCopy.invoicePreview}>
          <div className="preview-logo">
            {invoice.logoDataUrl ? (
              <img
                alt=""
                className="preview-logo-image"
                src={invoice.logoDataUrl}
              />
            ) : (
              <span>{invoice.logoLetter || "L"}</span>
            )}
          </div>

          <div className="preview-meta">
            <div>
              <span className="preview-muted">{copy.invoiceNo}: </span>
              {displayValue(invoice.invoiceNo)}
            </div>
            <div>
              <span className="preview-muted">{copy.issueDate}: </span>
              {formatDate(invoice.issueDate, invoice.taxCountryCode)}
            </div>
            <div className="preview-meta-right">
              <span className="preview-muted">{copy.dueDate}: </span>
              {formatDate(invoice.dueDate, invoice.taxCountryCode)}
            </div>
          </div>

          <div className="preview-from">
            <PartyPreview
              taxIdLabel={copy.taxId}
              title={copy.from}
              party={invoice.from}
            />
          </div>
          <div className="preview-to">
            <PartyPreview
              taxIdLabel={copy.taxId}
              title={copy.to}
              party={invoice.to}
            />
          </div>

          <div className="preview-items">
            <div className="preview-item-row preview-muted">
              <span>{copy.item}</span>
              <span>{copy.quantity}</span>
              <span>{copy.unitPrice}</span>
            </div>
            {invoice.items.map((item) => (
              <div className="preview-item-row" key={item.id}>
                <span>{displayValue(item.item)}</span>
                <span>{displayValue(item.quantity)}</span>
                <span>
                  {formatCurrency(item.price, {
                    countryCode: invoice.taxCountryCode,
                    grouped: false,
                  })}
                </span>
              </div>
            ))}
          </div>

          <div className="preview-totals">
            <div className="preview-tax-row">
              <span className="preview-muted">{copy.subtotal}</span>
              <span className="preview-muted">
                {formatCurrency(subtotal, {
                  countryCode: invoice.taxCountryCode,
                  decimals: 2,
                })}
              </span>
            </div>
            <div className="preview-tax-row">
              <span className="preview-muted">
                {copy.taxName} {formatRate(taxRate)}
              </span>
              <span className="preview-muted">
                {formatCurrency(invoice.salesTax, {
                  countryCode: invoice.taxCountryCode,
                  decimals: 2,
                })}
              </span>
            </div>
            <div className="preview-rule" />
            <div className="preview-total-row">
              <span className="preview-muted">{copy.total}</span>
              <span className="preview-total">
                {formatCurrency(invoice.total, {
                  countryCode: invoice.taxCountryCode,
                  decimals: 2,
                })}
              </span>
            </div>
          </div>

          <div className="preview-payment">
            <div className="preview-muted preview-heading">
              {copy.paymentDetails}
            </div>
            <div>
              {copy.beneficiary}: {displayValue(invoice.payment.beneficiary)}
            </div>
            <div>
              {copy.bank}: {displayValue(invoice.payment.bank)}
            </div>
            <div>IBAN: {displayValue(formatIban(invoice.payment.iban))}</div>
            <div>BIC/SWIFT: {displayValue(invoice.payment.bic)}</div>
            <div>
              {copy.reference}: {displayValue(invoice.payment.reference)}
            </div>
            <div>{displayValue(invoice.payment.terms)}</div>
          </div>

          <div className="preview-note">
            <div className="preview-muted preview-heading">{copy.note}</div>
            <div>{displayValue(invoice.note)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
