import fs from "fs";
import path from "path";

// Function to generate a simple valid minimal PDF file
function createMinimalPdf(title, author) {
  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 22 Tf
50 720 Td
(${title}) Tj
/F1 14 Tf
0 -40 Td
(CompX - Study smart. Score higher.) Tj
0 -30 Td
(Author: ${author}) Tj
0 -40 Td
(Official Study Material - Licensed for Personal Use Only) Tj
0 -30 Td
(Anti-Piracy Watermarked Copy) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000236 00000 n 
0000000488 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
567
%%EOF`;
}

// Function to generate a simple SVG for UPI QR placeholder
function createSampleQrSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <rect width="300" height="300" fill="#ffffff" rx="16"/>
    <rect x="25" y="25" width="70" height="70" fill="#1e3a8a" rx="8"/>
    <rect x="35" y="35" width="50" height="50" fill="#ffffff" rx="4"/>
    <rect x="45" y="45" width="30" height="30" fill="#1e3a8a" rx="2"/>
    <rect x="205" y="25" width="70" height="70" fill="#1e3a8a" rx="8"/>
    <rect x="215" y="35" width="50" height="50" fill="#ffffff" rx="4"/>
    <rect x="225" y="45" width="30" height="30" fill="#1e3a8a" rx="2"/>
    <rect x="25" y="205" width="70" height="70" fill="#1e3a8a" rx="8"/>
    <rect x="35" y="215" width="50" height="50" fill="#ffffff" rx="4"/>
    <rect x="45" y="225" width="30" height="30" fill="#1e3a8a" rx="2"/>
    <circle cx="150" cy="150" r="28" fill="#f97316"/>
    <text x="150" y="156" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">UPI</text>
    <rect x="115" y="40" width="20" height="40" fill="#1e3a8a"/>
    <rect x="150" y="40" width="30" height="20" fill="#1e3a8a"/>
    <rect x="120" y="100" width="60" height="20" fill="#1e3a8a"/>
    <rect x="110" y="200" width="30" height="50" fill="#1e3a8a"/>
    <rect x="160" y="210" width="40" height="20" fill="#1e3a8a"/>
    <rect x="220" y="120" width="50" height="30" fill="#1e3a8a"/>
    <rect x="210" y="170" width="30" height="40" fill="#1e3a8a"/>
    <text x="150" y="285" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">Scan & Pay via any UPI App</text>
  </svg>`;
}

const dirs = [
  "public/images",
  "public/uploads",
  "storage/sample-pdfs",
  "storage/previews",
  "storage/uploads"
];

for (const d of dirs) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

// Write sample QR
fs.writeFileSync("public/images/sample-upi-qr.svg", createSampleQrSvg());
fs.writeFileSync("public/images/sample-payment-screenshot.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));

// Write sample PDFs
const samplePdfs = [
  { name: "class10-science-topper-notes.pdf", title: "Class 10 Science Topper Notes", author: "Er. Ramesh Verma" },
  { name: "jee-physics-formula-bible.pdf", title: "JEE Main Physics Formula Bible", author: "Prof. Alok Gupta" },
  { name: "free-class10-maths-formulas.pdf", title: "Class 10 Maths All Formulas", author: "CompX Team" },
  { name: "upsc-modern-history-mindmaps.pdf", title: "UPSC Modern History Mindmaps", author: "Aditya Mukherjee" },
  { name: "dsa-ultimate-interview-notes.pdf", title: "DSA Ultimate Interview Notes", author: "Siddharth Verma" },
  { name: "free-python-cheat-sheet.pdf", title: "Python Quick Reference Cheat Sheet", author: "CompX Tech" },
  { name: "neet-biology-ncert-diagrams.pdf", title: "NEET Biology 360 Diagrams", author: "Dr. Neha Singhal" },
  { name: "nda-cds-maths-shortcuts.pdf", title: "NDA & CDS Maths Shortcuts", author: "Col. Sanjeev Nair" },
  { name: "ssc-quant-smart-notes.pdf", title: "SSC Quantitative Aptitude Revision", author: "Vikram Sir" },
  { name: "btech-os-dbms-notes.pdf", title: "B.Tech OS & DBMS Semester Notes", author: "CompX Academic" },
];

for (const pdf of samplePdfs) {
  fs.writeFileSync(path.join("storage/sample-pdfs", pdf.name), createMinimalPdf(pdf.title, pdf.author));
  fs.writeFileSync(path.join("storage/previews", pdf.name), createMinimalPdf(`PREVIEW: ${pdf.title}`, "CompX Sample Preview"));
}

console.log("✅ Sample PDFs and assets generated successfully.");

