export type PdfChildData = {
fullName: string;
age?: number;
height?: number;
weight?: number;
gender?: string | null;
medicalNotes?: string | null;
};

// Builds simple HTML used by expo-print to generate the PDF
// This is a very basic implementation and can be improved with better styling and layout.
export const buildPdfHtml = (data: PdfChildData) => `<!DOCTYPE html>
<html>
    <head>
    <meta charset="utf-8" />
    <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
        h1 { font-size: 24px; margin-bottom: 12px; }
        h2 { font-size: 16px; margin-top: 18px; margin-bottom: 6px; color: #007AFF; }
        .card { border: 1px solid #e5e5e5; border-radius: 12px; padding: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .label { font-weight: 600; color: #555; }
        .value { color: #111; }
    </style>
    </head>
    <body>
    <h1>Child Guard ID</h1>
    <div class="card">
        <div class="row"><span class="label">Full Name:</span><span class="value">${data.fullName}</span></div>
        <div class="row"><span class="label">Age:</span><span class="value">${data.age ?? ""}</span></div>
        <div class="row"><span class="label">Gender:</span><span class="value">${data.gender || "—"}</span></div>
        <div class="row"><span class="label">Height (cm):</span><span class="value">${data.height ?? ""}</span></div>
        <div class="row"><span class="label">Weight (kg):</span><span class="value">${data.weight ?? ""}</span></div>
        <h2>Medical Notes</h2>
        <p>${data.medicalNotes || "None provided"}</p>
    </div>
    </body>
</html>`;
