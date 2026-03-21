import { z } from "zod";

// ─── Helper for numeric coercion ───────────────────────────────────────────────
const numericField = (minVal: number, maxVal: number, label: string) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => {
      // Handle both string and number inputs
      let strVal: string;
      if (typeof val === "number") {
        if (isNaN(val)) {
          throw new Error(`${label} must be a number`);
        }
        strVal = String(val);
      } else {
        strVal = val.trim();
      }

      if (strVal === "") return undefined;
      const num = Number(strVal);
      if (isNaN(num)) throw new Error(`${label} must be a number`);
      if (num < minVal) throw new Error(`${label} seems too low`);
      if (num > maxVal) throw new Error(`${label} seems too high`);
      return num;
    })
    .optional()
    .refine((val) => val !== undefined, {
      message: `${label} is required`,
    });

// ─── Emergency Contact Schema ──────────────────────────────────────────────────
export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  sex: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
});

// ─── Child Profile Schema ──────────────────────────────────────────────────────
export const childSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  imageUri: z.string().optional(),
  age: numericField(0, 18, "Age"),
  height: numericField(30, 250, "Height"),
  weight: numericField(2, 200, "Weight"),
  gender: z.string().optional(),
  medicalNotes: z.string().max(300, "Notes too long").optional(),
  hasBirthmarks: z.string().optional(),
  birthmarksDescription: z.string().optional(),
  hasScars: z.string().optional(),
  scarsDescription: z.string().optional(),
  hasIdentifyingFeatures: z.string().optional(),
  identifyingFeaturesDescription: z.string().optional(),
  birthmarkImageUris: z.array(z.string()).max(3).optional(),
  scarImageUris: z.array(z.string()).max(3).optional(),
  identifyingFeatureImageUris: z.array(z.string()).max(3).optional(),
  lastKnownLocation: z.string().optional(),
  schoolDaycareType: z.string().optional(),
  schoolDaycareName: z.string().optional(),
  sportsTeams: z.string().optional(),
  parent1Name: z.string().optional(),
  parent1Address: z.string().optional(),
  parent1Phone: z.string().optional(),
  parent2Name: z.string().optional(),
  parent2Address: z.string().optional(),
  parent2Phone: z.string().optional(),
  emergencyContacts: z
    .array(emergencyContactSchema)
    .min(1, "At least one contact required"),
});

// ─── TypeScript Types ──────────────────────────────────────────────────────────
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type ChildFormData = z.infer<typeof childSchema>;
export type ChildProfile = ChildFormData & {
  id: string;
};

// ─── Default Values ────────────────────────────────────────────────────────────
export const defaultEmergencyContact: EmergencyContact = {
  name: "",
  relationship: "",
  sex: "",
  phone: "",
  address: "",
};

export const getDefaultChildFormData = (): ChildFormData => ({
  fullName: "",
  imageUri: "",
  birthmarkImageUris: [],
  scarImageUris: [],
  identifyingFeatureImageUris: [],
  gender: "",
  medicalNotes: "",
  emergencyContacts: [defaultEmergencyContact],
});
