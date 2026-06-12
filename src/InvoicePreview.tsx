import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatCurrency,
  formatDate,
  formatRate,
  getTaxCountry,
  invoiceWithResolvedTotal,
  type InvoiceData,
  type Party,
} from "./invoice";

type InvoicePreviewProps = {
  data: InvoiceData;
};

const BASE_WIDTH = 595;
const BASE_HEIGHT = 842;

const PartyPreview = ({ title, party }: { title: string; party: Party }) => (
  <div className="preview-party">
    <div className="preview-muted preview-heading">{title}</div>
    <div>{party.name}</div>
    <div>{party.email}</div>
    <div>{party.phone}</div>
    <div>{party.address}</div>
    <div>{party.cityLine}</div>
    <div>VAT ID: {party.vatId}</div>
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
              {formatDate(invoice.issueDate)}
            </div>
            <div className="preview-meta-right">
              <span className="preview-muted">Due date: </span>
              {formatDate(invoice.dueDate)}
            </div>
          </div>

          <div className="preview-from">
            <PartyPreview title="From" party={invoice.from} />
          </div>
          <div className="preview-to">
            <PartyPreview title="To" party={invoice.to} />
          </div>

          <div className="preview-items">
            <div className="preview-item-row preview-muted">
              <span>Item</span>
              <span>Quantity</span>
              <span>Price</span>
            </div>
            {invoice.items.map((item) => (
              <div className="preview-item-row" key={item.id}>
                <span>{item.item}</span>
                <span>{item.quantity}</span>
                <span>{formatCurrency(item.price, { grouped: false })}</span>
              </div>
            ))}
          </div>

          <div className="preview-totals">
            <div className="preview-tax-row">
              <span className="preview-muted">
                {taxCountry.taxName} {formatRate(taxCountry.rate)}
              </span>
              <span className="preview-muted">
                {formatCurrency(invoice.salesTax)}
              </span>
            </div>
            <div className="preview-rule" />
            <div className="preview-total-row">
              <span className="preview-muted">Total</span>
              <span className="preview-total">
                {formatCurrency(invoice.total, { decimals: 2 })}
              </span>
            </div>
          </div>

          <div className="preview-payment">
            <div className="preview-muted preview-heading">Payment details</div>
            <div>Bank: {invoice.payment.bank}</div>
            <div>Account number: {invoice.payment.accountNumber},</div>
            <div>Iban: {invoice.payment.iban},</div>
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
