export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const CONSENT_VERSION = "2026-09-v1";
export const categories = [
  "Medical Report",
  "Lab Test",
  "CT",
  "MRI",
  "Pathology",
  "Ultrasound",
  "Prescription",
  "Discharge Summary",
  "Diagnosis",
  "Blood Test",
  "Surgical Record",
  "Other",
];
export const categoryZh = [
  "医疗报告",
  "化验",
  "CT",
  "MRI",
  "病理",
  "超声",
  "处方",
  "出院小结",
  "诊断",
  "血液检查",
  "手术记录",
  "其他",
];
export const statuses = [
  "Draft",
  "Records Submitted",
  "Case Preparation",
  "Additional Information Required",
  "Ready for Hospital Review",
  "Hospital Review",
  "Plan Available",
  "Patient Decision",
  "Travel Confirmed",
  "In China",
  "Treatment Completed",
  "Follow-up",
  "Closed",
  "Under Review",
  "Completed",
] as const;
export const preferredGoals = [
  "Treatment",
  "Second Opinion",
  "Surgery Evaluation",
  "Diagnosis Review",
  "Other",
] as const;
export const preferredGoalZh = [
  "治疗",
  "第二诊疗意见",
  "手术评估",
  "诊断复核",
  "其他",
];
export function canAccess(user: { id: string; admin: boolean }, owner: string) {
  return user.admin || user.id === owner;
}
export function validConsent(accepted: unknown, version: unknown) {
  return accepted === true && version === CONSENT_VERSION;
}
export function validateUpload(
  name: string,
  mime: string,
  bytes: Uint8Array,
): string | null {
  if (!bytes.length || bytes.length > MAX_FILE_SIZE)
    return "Files must be between 1 byte and 20 MB.";
  const ext = name.split(".").pop()?.toLowerCase();
  const allowed: Record<string, string[]> = {
    pdf: ["application/pdf"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    zip: ["application/zip", "application/x-zip-compressed"],
    doc: ["application/msword"],
    docx: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  };
  if (!ext || !allowed[ext] || !allowed[ext].includes(mime))
    return "Use PDF, JPG, PNG, DICOM ZIP, DOC or DOCX.";
  const hex = Buffer.from(bytes.subarray(0, 8)).toString("hex");
  const signatures: Record<string, string> = {
    pdf: "255044462d",
    jpg: "ffd8ff",
    jpeg: "ffd8ff",
    png: "89504e470d0a1a0a",
    zip: "504b0304",
    docx: "504b0304",
    doc: "d0cf11e0a1b11ae1",
  };
  if (!hex.startsWith(signatures[ext]))
    return "File content does not match its type.";
  return null;
}
