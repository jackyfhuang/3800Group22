import { PHONE_FORMAT_REGEX } from "@/utils/phone";
import { z } from "zod";

const guardianSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .regex(PHONE_FORMAT_REGEX, "Phone number must be in format (000) 000-0000"),
  address: z.string().optional(),
});

const primaryGuardianSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .regex(PHONE_FORMAT_REGEX, "Phone number must be in format (000) 000-0000"),
  address: z.string().min(1, "Address is required"),
});

const emergencyContactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  relationship: z.string().min(2, "Relationship is required"),
  phone: z
    .string()
    .regex(PHONE_FORMAT_REGEX, "Phone number must be in format (000) 000-0000"),
  address: z.string().optional(),
});

export const childSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  sex: z.string().min(1, "Sex is required"),
  ethnicity: z.string().min(2, "Ethnicity is required"),
  skinColor: z.string().min(1, "Skin color is required"),
  skinColorOther: z.string().optional(),
  languageSpoken: z.string().min(1, "Language spoken is required"),
  unitSystem: z.enum(["imperial", "metric"]),
  height: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : parseFloat(String(v))),
    z
      .number()
      .min(30, "Height (cm) seems too low")
      .max(250, "Height seems too high")
      .optional(),
  ),
  heightFeet: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : parseFloat(String(v))),
    z
      .number()
      .min(1, "Height (ft) seems too low")
      .max(8, "Height (ft) seems too high")
      .optional(),
  ),
  heightInches: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : parseFloat(String(v))),
    z
      .number()
      .min(0, "Inches must be 0 or more")
      .max(11, "Inches must be 11 or less")
      .optional(),
  ),
  weight: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : parseFloat(String(v))),
    z.number().min(1, "Weight seems too low").optional(),
  ),
  hasTrackingDevice: z.string().optional(),
  trackingDeviceType: z.string().optional(),
  trackingDeviceTypeOther: z.string().optional(),
  trackingDeviceDetails: z.string().optional(),
  eyeColor: z.string().min(1, "Eye color is required"),
  eyeColorOther: z.string().optional(),
  hairColor: z.string().min(1, "Hair color is required"),
  hairColorOther: z.string().optional(),
  hairStyle: z.string().min(1, "Hair style is required"),
  hasHat: z.boolean().optional(),
  hatColor: z.string().optional(),
  hatStyle: z.string().optional(),
  topColor: z.string().optional(),
  pantsColor: z.string().optional(),
  shoesColor: z.string().optional(),
  shoesType: z.string().optional(),
  hasGlasses: z.boolean().optional(),
  hasHearingAids: z.boolean().optional(),
  otherSensoryNeeds: z.string().optional(),
  lifeThreatAllergies: z
    .string()
    .min(1, "Life-threatening allergies is required"),
  emergencyMedications: z.string().min(1, "Emergency medications is required"),
  communicationNeeds: z.string().optional(),
  communicationNeedsOther: z.string().optional(),
  otherMedicalNotes: z.string().optional(),
  imageUri: z.string().optional(),
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
  guardian1: primaryGuardianSchema,
  guardian2: guardianSchema,
  emergencyContacts: z
    .array(emergencyContactSchema)
    .max(2, "You can add up to 2 additional emergency contacts"),
});

export type ChildFormData = z.infer<typeof childSchema>;

export const STEP_FIELDS: Record<number, (keyof ChildFormData)[]> = {
  1: [
    "firstName",
    "lastName",
    "dateOfBirth",
    "sex",
    "ethnicity",
    "skinColor",
    "languageSpoken",
    "eyeColor",
    "hairColor",
    "hairStyle",
  ],
  2: ["lifeThreatAllergies", "emergencyMedications"],
  3: ["guardian1", "guardian2", "emergencyContacts"],
  4: [],
};

export const YES_NO_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export type FeatureImageFieldName =
  | "birthmarkImageUris"
  | "scarImageUris"
  | "identifyingFeatureImageUris";

export const SEX_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export const COMMUNICATION_OPTIONS = [
  { label: "None", value: "None" },
  { label: "Verbal", value: "verbal" },
  { label: "Non-verbal", value: "non_verbal" },
  { label: "Language Barrier", value: "language_barrier" },
  { label: "Other", value: "other" },
];

export const SKIN_COLOR_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Fair", value: "fair" },
  { label: "Medium", value: "medium" },
  { label: "Olive", value: "olive" },
  { label: "Brown", value: "brown" },
  { label: "Dark Brown", value: "dark_brown" },
  { label: "Dark", value: "dark" },
  { label: "Other", value: "other" },
];

export const TRACKING_DEVICE_OPTIONS = [
  { label: "Phone", value: "phone" },
  { label: "Watch", value: "watch" },
  { label: "AirTag", value: "airtag" },
  { label: "Tile", value: "tile" },
  { label: "Other", value: "other" },
];

export const EYE_COLOR_OPTIONS = [
  { label: "Brown", value: "brown" },
  { label: "Blue", value: "blue" },
  { label: "Green", value: "green" },
  { label: "Hazel", value: "hazel" },
  { label: "Grey", value: "grey" },
  { label: "Amber", value: "amber" },
  { label: "Other", value: "other" },
];

export const HAIR_COLOR_OPTIONS = [
  { label: "Black", value: "black" },
  { label: "Dark Brown", value: "dark_brown" },
  { label: "Brown", value: "brown" },
  { label: "Light Brown", value: "light_brown" },
  { label: "Blonde", value: "blonde" },
  { label: "Red", value: "red" },
  { label: "Grey", value: "grey" },
  { label: "White", value: "white" },
  { label: "Other", value: "other" },
];
