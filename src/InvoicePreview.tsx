import { useEffect, useMemo, useRef, useState } from "react";
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
    <div>{party.name}</div>
    <div>{party.email}</div>
    <div>{party.phone}</div>
    <div>{party.address}</div>
    <div>{party.cityLine}</div>
    <div>
      {taxIdLabel}: {party.vatId}
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
  const subtotal = useMemo(() => invoiceSubtotal(invoice), [invoice]);

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
        <div className="invoice-paper" aria-label="Invoice preview">
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
              <span className="preview-muted">Invoice NO: </span>
              {invoice.invoiceNo}
            </div>
            <div>
              <span className="preview-muted">Issue date: </span>
              {formatDate(invoice.issueDate, invoice.taxCountryCode)}
            </div>
            <div className="preview-meta-right">
              <span className="preview-muted">Due date: </span>
              {formatDate(invoice.dueDate, invoice.taxCountryCode)}
            </div>
          </div>

          <div className="preview-from">
            <PartyPreview
              taxIdLabel={taxCountry.taxIdLabel}
              title="From"
              party={invoice.from}
            />
          </div>
          <div className="preview-to">
            <PartyPreview
              taxIdLabel={taxCountry.taxIdLabel}
              title="To"
              party={invoice.to}
            />
          </div>

          <div className="preview-items">
            <div className="preview-item-row preview-muted">
              <span>Item</span>
              <span>Qty</span>
              <span>Unit price</span>
            </div>
            {invoice.items.map((item) => (
              <div className="preview-item-row" key={item.id}>
                <span>{item.item}</span>
                <span>{item.quantity}</span>
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
              <span className="preview-muted">Subtotal</span>
              <span className="preview-muted">
                {formatCurrency(subtotal, {
                  countryCode: invoice.taxCountryCode,
                  decimals: 2,
                })}
              </span>
            </div>
            <div className="preview-tax-row">
              <span className="preview-muted">
                {taxCountry.taxName} {formatRate(taxCountry.rate)}
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
              <span className="preview-muted">Total</span>
              <span className="preview-total">
                {formatCurrency(invoice.total, {
                  countryCode: invoice.taxCountryCode,
                  decimals: 2,
                })}
              </span>
            </div>
          </div>

          <div className="preview-payment">
            <div className="preview-muted preview-heading">Payment details</div>
            <div>Beneficiary: {invoice.payment.beneficiary}</div>
            <div>Bank: {invoice.payment.bank}</div>
            <div>IBAN: {formatIban(invoice.payment.iban)}</div>
            <div>BIC/SWIFT: {invoice.payment.bic}</div>
            <div>Reference: {invoice.payment.reference}</div>
            <div>{invoice.payment.terms}</div>
          </div>

          <div className="preview-note">
            <div className="preview-muted preview-heading">Note</div>
            <div>{invoice.note}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
