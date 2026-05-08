import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { Report } from "../types";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function buildHtml(report: Report): string {
  const patientPart = report.patientDemographics.split(" ")[0] || "";
  const sexLabel = report.patientSex === "M" ? "Male" : "Female";
  const isMRSA = report.isMRSA;

  const astRows = report.astResults
    .map((ast) => {
      const color = ast.result === "R" ? "#E53935" : ast.result === "I" ? "#FB8C00" : "#43A047";
      const bg = ast.result === "R" ? "#FDECEA" : "#FFFFFF";
      return `
        <tr style="background:${bg}">
          <td style="padding:10px 12px;font-size:14px;color:#111827;">${ast.antibiotic}</td>
          <td style="padding:10px 12px;font-size:12px;color:#6B7280;">${ast.abbreviation}</td>
          <td style="padding:10px 12px;text-align:center;">
            <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${color};color:#fff;font-weight:700;font-size:12px;line-height:28px;text-align:center;">${ast.result}</span>
          </td>
        </tr>`;
    })
    .join("");

  const mrsaBadge = isMRSA
    ? '<span style="display:inline-block;background:#FDECEA;color:#9C27B0;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">Methicillin-Resistant (MRSA)</span>'
    : '<span style="display:inline-block;background:#FDECEA;color:#9C27B0;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">Methicillin-Susceptible (MSSA)</span>';

  const resistanceText = isMRSA
    ? "MRSA detected. Avoid beta-lactams. Consider Vancomycin or Linezolid based on susceptibility."
    : "MSSA detected. Beta-lactams such as Oxacillin remain effective. Confirm full susceptibility panel before prescribing.";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,Helvetica,Arial,sans-serif; background:#f9fafb; padding:20px; }
    .card {
      background:#1A2340; border-radius:12px; padding:24px; margin-bottom:16px; color:#fff;
    }
    .card h2 { font-size:14px; font-weight:500; color:#9CA3AF; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; }
    .card h1 { font-size:22px; font-weight:700; margin-bottom:12px; }
    .badge { display:inline-block; background:#16A34A; color:#fff; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:600; }
    .grid { display:flex; flex-wrap:wrap; margin-top:12px; }
    .grid-item { flex:1; min-width:50%; margin-bottom:8px; }
    .grid-item .label { font-size:11px; color:#9CA3AF; margin-bottom:2px; }
    .grid-item .value { font-size:14px; font-weight:500; color:#fff; }
    .section {
      background:#fff; border-radius:12px; padding:16px; margin-bottom:16px;
      box-shadow:0 1px 3px rgba(0,0,0,0.08);
    }
    .section h3 { font-size:11px; font-weight:600; color:#6B7280; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }
    table { width:100%; border-collapse:collapse; }
    th { text-align:left; padding:8px 12px; font-size:11px; color:#6B7280; border-bottom:1px solid #E5E7EB; text-transform:uppercase; letter-spacing:1px; }
    .organism { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
    .organism-name { font-size:18px; font-weight:700; color:#111827; }
    .organism-meta { font-size:13px; color:#6B7280; }
    .resistance { background:#f3f4f6; border-radius:12px; padding:16px; margin-bottom:16px; }
    .resistance h3 { font-size:11px; font-weight:600; color:#6B7280; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; }
    .resistance p { font-size:13px; color:#374151; line-height:1.6; }
    .remarks { background:#FFFBEB; border:1px solid #FDE68A; border-radius:12px; padding:16px; margin-bottom:16px; }
    .remarks h3 { font-size:11px; font-weight:600; color:#D97706; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; }
    .remarks p { font-size:13px; color:#374151; line-height:1.6; }
    .footer { text-align:center; font-size:11px; color:#9CA3AF; border-top:1px solid #E5E7EB; padding-top:12px; margin-top:4px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>MUST Microbiology Laboratory</h2>
    <h1>${report.organism} Susceptibility Report</h1>
    <div style="text-align:right;margin-bottom:12px;"><span class="badge">FINAL</span></div>
    <div class="grid">
      <div class="grid-item">
        <div class="label">Report ID</div>
        <div class="value">${report.id}</div>
      </div>
      <div class="grid-item">
        <div class="label">Date</div>
        <div class="value">${formatDate(report.date)}</div>
      </div>
      <div class="grid-item">
        <div class="label">Specimen</div>
        <div class="value">${report.specimenType}</div>
      </div>
      <div class="grid-item">
        <div class="label">Sex</div>
        <div class="value">${sexLabel}</div>
      </div>
      <div class="grid-item">
        <div class="label">Patient</div>
        <div class="value">${patientPart}</div>
      </div>
      ${report.growthTimeHours ? `
      <div class="grid-item">
        <div class="label">Growth Time</div>
        <div class="value">${report.growthTimeHours} hours</div>
      </div>` : ""}
    </div>
  </div>

  <div class="section">
    <h3>Organism Identified</h3>
    <div class="organism">
      <div>
        <div class="organism-name">${report.organism}</div>
        <div class="organism-meta">Gram-Positive Cocci | MALDI-TOF</div>
      </div>
    </div>
    <div style="margin-top:8px;">${mrsaBadge}</div>
  </div>

  <div class="section">
    <h3>Antimicrobial Susceptibility (${report.astResults.length} Antibiotics)</h3>
    <p style="font-size:12px;color:#9CA3AF;margin-bottom:12px;">Disc Diffusion | CLSI Guidelines</p>
    <table>
      <thead>
        <tr>
          <th>Antibiotic</th>
          <th>Code</th>
          <th style="text-align:center;">Result</th>
        </tr>
      </thead>
      <tbody>
        ${astRows}
      </tbody>
    </table>
  </div>

  <div class="resistance">
    <h3>Local ${report.organism.toUpperCase()} Resistance Context</h3>
    <p>${resistanceText}</p>
  </div>

  ${report.remarks ? `
  <div class="remarks">
    <h3>Technician Remarks</h3>
    <p>${report.remarks}</p>
  </div>` : ""}

  <div class="footer">
    Published by: ${report.authorisedByName || report.authorisedBy} | ${formatDate(report.date)}
  </div>
</body>
</html>`;
}

export async function downloadReportPdf(report: Report): Promise<void> {
  const html = buildHtml(report);
  
  try {
    const { uri } = await Print.printToFileAsync({ html });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert("Error", "Sharing is not available on this device.");
      return;
    }

    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Save Report" });
  } catch (e) {
    console.error("PDF download error:", e);
    Alert.alert("Error", "Failed to download report.");
  }
}
