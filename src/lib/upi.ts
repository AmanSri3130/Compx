import QRCode from "qrcode";

export interface UpiParams {
  pa: string; // Payee VPA / UPI ID
  pn: string; // Payee Name
  am: number; // Amount
  tn: string; // Transaction Note / Order ID
  cu?: string; // Currency (INR)
}

/**
 * Builds the standard Indian UPI Intent URI:
 * upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
 * Supported natively by Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay on Android & iOS.
 */
export function buildUpiUri(params: UpiParams): string {
  const { pa, pn, am, tn, cu = "INR" } = params;
  const encodedPn = encodeURIComponent(pn);
  const encodedTn = encodeURIComponent(tn);
  const formattedAmount = am.toFixed(2);

  return `upi://pay?pa=${pa}&pn=${encodedPn}&am=${formattedAmount}&cu=${cu}&tn=${encodedTn}`;
}

/**
 * Generate a dynamic QR code Data URL (PNG base64) pre-filled with the exact order amount and order note
 */
export async function generateDynamicUpiQr(params: UpiParams): Promise<string> {
  const uri = buildUpiUri(params);
  try {
    const dataUrl = await QRCode.toDataURL(uri, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#1e3a8a", // CompX deep blue
        light: "#ffffff",
      },
    });
    return dataUrl;
  } catch (err) {
    console.error("Failed to generate dynamic UPI QR code", err);
    throw err;
  }
}

/**
 * Build WhatsApp checkout URL with formatted message
 */
export function buildWhatsAppOrderUrl(params: {
  phone: string;
  orderId: string;
  customerName: string;
  noteTitles: string[];
  amount: number;
}): string {
  const cleanPhone = params.phone.replace(/[^0-9]/g, "");
  const titlesList = params.noteTitles.map((t, i) => `${i + 1}. ${t}`).join("\n");
  
  const message = `*CompX Notes - Order #${params.orderId}*
━━━━━━━━━━━━━━━━━
*Student Name:* ${params.customerName}
*Total Amount:* ₹${params.amount}
*Selected Notes:*
${titlesList}

Hello Admin, I have placed this order on CompX and would like to confirm my payment. Please share UPI details or verify my transaction.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

