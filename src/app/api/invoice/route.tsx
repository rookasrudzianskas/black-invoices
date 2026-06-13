import { pdf } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { InvoicePdf } from "../../../InvoicePdf";
import {
  invoiceWithResolvedTotal,
  safeFileName,
  type InvoiceData,
} from "../../../invoice";

export const runtime = "nodejs";

const streamToBuffer = async (stream: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

const logoFromDataUrl = (dataUrl: string) => {
  const match = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(dataUrl);

  if (!match) {
    return null;
  }

  return {
    format: match[1].toLowerCase(),
    bytes: Buffer.from(match[2], "base64"),
  };
};

const stampUploadedLogo = async (pdfBytes: Buffer, logoDataUrl: string) => {
  const logo = logoFromDataUrl(logoDataUrl);

  if (!logo) {
    return pdfBytes;
  }

  try {
    const document = await PDFDocument.load(pdfBytes);
    const [page] = document.getPages();
    const image =
      logo.format === "png"
        ? await document.embedPng(logo.bytes)
        : await document.embedJpg(logo.bytes);

    const box = { left: 48, top: 48, size: 46 };
    const scaled = image.scaleToFit(box.size, box.size);
    const x = box.left + (box.size - scaled.width) / 2;
    const y =
      page.getHeight() - box.top - box.size + (box.size - scaled.height) / 2;

    page.drawImage(image, {
      x,
      y,
      width: scaled.width,
      height: scaled.height,
    });

    return Buffer.from(await document.save());
  } catch {
    return pdfBytes;
  }
};

const readInvoice = async (request: Request) => {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as InvoiceData;
  }

  const formData = await request.formData();
  const rawInvoice = formData.get("invoice");

  if (typeof rawInvoice !== "string") {
    throw new Error("Missing invoice payload");
  }

  return JSON.parse(rawInvoice) as InvoiceData;
};

export async function POST(request: Request) {
  let invoice: InvoiceData;

  try {
    invoice = invoiceWithResolvedTotal(await readInvoice(request));
  } catch {
    return Response.json({ error: "Invalid invoice payload" }, { status: 400 });
  }

  const stream = await pdf(<InvoicePdf data={invoice} />).toBuffer();
  const buffer = await stampUploadedLogo(
    await streamToBuffer(stream),
    invoice.logoDataUrl,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Disposition": `attachment; filename="${safeFileName(invoice.invoiceNo)}"`,
      "Content-Type": "application/pdf",
    },
  });
}
