"use client";

import { ArrowDownToLine } from "lucide-react";
import { useState } from "react";
import { safeFileName, type InvoiceData } from "./invoice";

type PdfDownloadButtonProps = {
  data: InvoiceData;
  downloadLabel: string;
  renderingLabel: string;
};

export default function PdfDownloadButton({
  data,
  downloadLabel,
  renderingLabel,
}: PdfDownloadButtonProps) {
  const [isRendering, setIsRendering] = useState(false);
  const downloadPdf = async () => {
    setIsRendering(true);
    window.setTimeout(() => setIsRendering(false), 1400);

    const form = document.createElement("form");
    const payload = document.createElement("input");

    form.method = "POST";
    form.action = "/api/invoice";
    form.style.display = "none";

    payload.type = "hidden";
    payload.name = "invoice";
    payload.value = JSON.stringify(data);

    form.append(payload);
    document.body.append(form);
    form.submit();
    form.remove();
  };

  return (
    <div className="download-cluster">
      <button
        className="download-button"
        type="button"
        onClick={downloadPdf}
        disabled={isRendering}
        aria-busy={isRendering}
      >
        <ArrowDownToLine size={17} aria-hidden="true" />
        {isRendering ? renderingLabel : downloadLabel}
      </button>
      <span className="download-filename" aria-live="polite">
        {safeFileName(data.invoiceNo)}
      </span>
    </div>
  );
}
