import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 595.28; // A4 at 72dpi
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const BRAND = rgb(0.267, 0.220, 0.788); // #4338ca
const INK = rgb(0.06, 0.09, 0.16);
const MUTED = rgb(0.42, 0.45, 0.5);

function money(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

/**
 * Renders a Quotation document to a downloadable PDF (spec section 17:
 * "Generate downloadable PDF quotation"). Kept dependency-light with pdf-lib
 * (pure JS, no native binaries) so it runs anywhere Next's Node runtime does.
 */
export async function generateQuotationPdf(quotation, vendor, appName) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;

  const text = (str, x, yy, opts = {}) => {
    page.drawText(String(str ?? ""), { x, y: yy, size: opts.size || 10, font: opts.bold ? bold : font, color: opts.color || INK });
  };

  // Header band
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 90, width: PAGE_WIDTH, height: 90, color: BRAND });
  text(appName || "BharatBizMart", MARGIN, PAGE_HEIGHT - 40, { size: 18, bold: true, color: rgb(1, 1, 1) });
  text("QUOTATION", PAGE_WIDTH - MARGIN - 100, PAGE_HEIGHT - 40, { size: 18, bold: true, color: rgb(1, 1, 1) });
  text(`Ref: QT-${String(quotation._id).slice(-8).toUpperCase()}`, PAGE_WIDTH - MARGIN - 150, PAGE_HEIGHT - 60, { size: 9, color: rgb(0.9, 0.9, 1) });

  y = PAGE_HEIGHT - 120;
  text("From", MARGIN, y, { bold: true, size: 11 });
  y -= 16;
  text(vendor?.businessName || "Vendor", MARGIN, y, { size: 10 });
  y -= 14;
  text([vendor?.address, vendor?.city, vendor?.state].filter(Boolean).join(", "), MARGIN, y, { size: 9, color: MUTED });
  y -= 14;
  if (vendor?.gstNumber) {
    text(`GSTIN: ${vendor.gstNumber}`, MARGIN, y, { size: 9, color: MUTED });
    y -= 14;
  }
  if (vendor?.phone) text(`Phone: ${vendor.phone}`, MARGIN, y, { size: 9, color: MUTED });

  text("Date", PAGE_WIDTH - MARGIN - 150, PAGE_HEIGHT - 120, { bold: true, size: 11 });
  text(new Date(quotation.createdAt || Date.now()).toLocaleDateString("en-IN"), PAGE_WIDTH - MARGIN - 150, PAGE_HEIGHT - 136, { size: 10 });
  text("Valid Till", PAGE_WIDTH - MARGIN - 150, PAGE_HEIGHT - 156, { bold: true, size: 11 });
  text(quotation.validTill ? new Date(quotation.validTill).toLocaleDateString("en-IN") : "-", PAGE_WIDTH - MARGIN - 150, PAGE_HEIGHT - 172, { size: 10 });

  y = PAGE_HEIGHT - 220;
  page.drawRectangle({ x: MARGIN, y: y - 4, width: PAGE_WIDTH - MARGIN * 2, height: 24, color: rgb(0.96, 0.96, 0.99) });
  text("Description", MARGIN + 8, y + 4, { bold: true, size: 9 });
  text("Qty", MARGIN + 260, y + 4, { bold: true, size: 9 });
  text("Unit Price", MARGIN + 320, y + 4, { bold: true, size: 9 });
  text("Amount", MARGIN + 420, y + 4, { bold: true, size: 9 });

  y -= 30;
  text(quotation.productName || "Product", MARGIN + 8, y, { size: 10 });
  text(String(quotation.quantity ?? "-"), MARGIN + 260, y, { size: 10 });
  text(money(quotation.unitPrice), MARGIN + 320, y, { size: 10 });
  text(money((quotation.unitPrice || 0) * (quotation.quantity || 0)), MARGIN + 420, y, { size: 10 });

  y -= 40;
  const subtotal = (quotation.unitPrice || 0) * (quotation.quantity || 0) - (quotation.discount || 0);
  const gst = subtotal * ((quotation.gstPercent || 0) / 100);
  const rows = [
    ["Subtotal", subtotal],
    ["Discount", -(quotation.discount || 0)],
    [`GST (${quotation.gstPercent || 0}%)`, gst],
    ["Shipping", quotation.shippingCharge || 0],
  ];
  for (const [label, val] of rows) {
    text(label, MARGIN + 320, y, { size: 9, color: MUTED });
    text(money(val), MARGIN + 420, y, { size: 9, color: MUTED });
    y -= 16;
  }
  page.drawLine({ start: { x: MARGIN + 320, y: y + 6 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 6 }, thickness: 1, color: rgb(0.85, 0.85, 0.9) });
  y -= 10;
  text("Total", MARGIN + 320, y, { bold: true, size: 11 });
  text(money(quotation.totalAmount), MARGIN + 420, y, { bold: true, size: 11, color: BRAND });

  y -= 50;
  text("Delivery Time", MARGIN, y, { bold: true, size: 10 });
  text(quotation.deliveryTime || "-", MARGIN + 120, y, { size: 10 });
  y -= 18;
  text("Payment Terms", MARGIN, y, { bold: true, size: 10 });
  text(quotation.paymentTerms || "-", MARGIN + 120, y, { size: 10 });

  if (quotation.notes) {
    y -= 28;
    text("Notes", MARGIN, y, { bold: true, size: 10 });
    y -= 16;
    text(quotation.notes.slice(0, 300), MARGIN, y, { size: 9, color: MUTED });
  }

  text("This is a system-generated quotation.", MARGIN, 40, { size: 8, color: MUTED });

  return doc.save();
}
