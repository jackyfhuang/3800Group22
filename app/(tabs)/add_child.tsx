import { DatePickerModal } from "@/components/ui/date-picker-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot, { captureRef } from "react-native-view-shot";
import { z } from "zod";

import { AppDropdown } from "@/components/ui/app-dropdown";
import { AppText } from "@/components/ui/app-text";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { ScreenHeader, confirmDiscard } from "@/components/ui/screen-header";
import { StepProgressBar } from "@/components/ui/step-progress-bar";
import { colors, sharedStyles, addChildStyles as styles } from "@/styles";
import { MaterialIcons } from "@expo/vector-icons";

// ─── Validation Schema ────────────────────────────────────────────────────────
const guardianSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  address: z.string().optional(),
});

const primaryGuardianSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
});

const emergencyContactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  relationship: z.string().min(2, "Relationship is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  address: z.string().optional(),
});

const childSchema = z.object({
  // ── Step 1: Essential ID ──────────────────────────────────────────────────
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
    z.number().min(30, "Height (cm) seems too low").max(250, "Height seems too high").optional(),
  ),
  heightFeet: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : parseFloat(String(v))),
    z.number().min(1, "Height (ft) seems too low").max(8, "Height (ft) seems too high").optional(),
  ),
  heightInches: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : parseFloat(String(v))),
    z.number().min(0, "Inches must be 0 or more").max(11, "Inches must be 11 or less").optional(),
  ),
  weight: z.preprocess(
    (v) => (v === undefined || v === "" ? undefined : parseFloat(String(v))),
    z.number().min(1, "Weight seems too low").optional(),
  ),
  hasTrackingDevice: z.string().optional(),
  trackingDeviceType: z.string().optional(),
  trackingDeviceTypeOther: z.string().optional(),
  trackingDeviceDetails: z.string().optional(),

  // ── Step 2: Visual Identifiers ────────────────────────────────────────────
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

  // ── Step 3: Medical ───────────────────────────────────────────────────────
  lifeThreatAllergies: z.string().min(1, "Life-threatening allergies is required"),
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

  // ── Step 4: Contacts ──────────────────────────────────────────────────────
  guardian1: primaryGuardianSchema,
  guardian2: guardianSchema,
  emergencyContacts: z.array(emergencyContactSchema),
});

type ChildFormData = z.infer<typeof childSchema>;

// ─── Step field keys for per-step validation ─────────────────────────────────
const STEP_FIELDS: Record<number, (keyof ChildFormData)[]> = {
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

const YES_NO_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

type FeatureImageFieldName =
  | "birthmarkImageUris"
  | "scarImageUris"
  | "identifyingFeatureImageUris";

// ─── Dropdown Options ─────────────────────────────────────────────────────────
const SEX_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const COMMUNICATION_OPTIONS = [
  { label: "None", value: "None" },
  { label: "Verbal", value: "verbal" },
  { label: "Non-verbal", value: "non_verbal" },
  { label: "Language Barrier", value: "language_barrier" },
  { label: "Other", value: "other" },
];

const SKIN_COLOR_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Fair", value: "fair" },
  { label: "Medium", value: "medium" },
  { label: "Olive", value: "olive" },
  { label: "Brown", value: "brown" },
  { label: "Dark Brown", value: "dark_brown" },
  { label: "Dark", value: "dark" },
  { label: "Other", value: "other" },
];

const TRACKING_DEVICE_OPTIONS = [
  { label: "Phone", value: "phone" },
  { label: "Watch", value: "watch" },
  { label: "AirTag", value: "airtag" },
  { label: "Tile", value: "tile" },
  { label: "Other", value: "other" },
];

const EYE_COLOR_OPTIONS = [
  { label: "Brown", value: "brown" },
  { label: "Blue", value: "blue" },
  { label: "Green", value: "green" },
  { label: "Hazel", value: "hazel" },
  { label: "Grey", value: "grey" },
  { label: "Amber", value: "amber" },
  { label: "Other", value: "other" },
];

const HAIR_COLOR_OPTIONS = [
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

// ─── Tab bar + progress bar height constants ──────────────────────────────────
const TAB_BAR_HEIGHT = 40;
const PROGRESS_BAR_HEIGHT = 90;
const BOTTOM_OFFSET = TAB_BAR_HEIGHT + PROGRESS_BAR_HEIGHT;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger,
    setValue,
    getValues,
    setError,
    clearErrors,
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema) as any,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      sex: "",
      ethnicity: "",
      skinColor: "",
      skinColorOther: "",
      languageSpoken: "",
      unitSystem: "imperial" as const,
      height: undefined,
      heightFeet: undefined,
      heightInches: undefined,
      weight: undefined,
      hasTrackingDevice: "",
      trackingDeviceType: "",
      trackingDeviceTypeOther: "",
      trackingDeviceDetails: "",
      lifeThreatAllergies: "",
      emergencyMedications: "",
      communicationNeeds: "",
      communicationNeedsOther: "",
      otherMedicalNotes: "",
      imageUri: "",
      hasBirthmarks: "no",
      birthmarksDescription: "",
      hasScars: "no",
      scarsDescription: "",
      hasIdentifyingFeatures: "no",
      identifyingFeaturesDescription: "",
      birthmarkImageUris: [],
      scarImageUris: [],
      identifyingFeatureImageUris: [],
      lastKnownLocation: "",
      schoolDaycareType: "none",
      schoolDaycareName: "",
      sportsTeams: "",
      guardian1: { name: "", phone: "", address: "" },
      guardian2: { name: "", phone: "", address: "" },
      emergencyContacts: [],
      eyeColor: "",
      eyeColorOther: "",
      hairColor: "",
      hairColorOther: "",
      hairStyle: "",
      hasHat: false,
      hatColor: "",
      hatStyle: "",
      topColor: "",
      pantsColor: "",
      shoesColor: "",
      shoesType: "",
      hasGlasses: false,
      hasHearingAids: false,
      otherSensoryNeeds: "",
    },
  });

  // ─── Watched values ───────────────────────────────────────────────────────
  const skinColor = watch("skinColor");
  const unitSystem = watch("unitSystem");
  const hasTrackingDevice = watch("hasTrackingDevice");
  const trackingDeviceType = watch("trackingDeviceType");
  const communicationNeeds = watch("communicationNeeds");
  const hasHat = watch("hasHat");
  const hasGlasses = watch("hasGlasses");
  const hasHearingAids = watch("hasHearingAids");
  const eyeColor = watch("eyeColor");
  const hairColor = watch("hairColor");
  const dateOfBirth = watch("dateOfBirth");
  const imageUri = watch("imageUri");
  const hasBirthmarks = watch("hasBirthmarks");
  const hasScars = watch("hasScars");
  const hasIdentifyingFeatures = watch("hasIdentifyingFeatures");
  const birthmarkImageUrisRaw = watch("birthmarkImageUris");
  const scarImageUrisRaw = watch("scarImageUris");
  const identifyingFeatureImageUrisRaw = watch("identifyingFeatureImageUris");
  const birthmarkImageUris = useMemo(
    () => birthmarkImageUrisRaw || [],
    [birthmarkImageUrisRaw],
  );
  const scarImageUris = useMemo(
    () => scarImageUrisRaw || [],
    [scarImageUrisRaw],
  );
  const identifyingFeatureImageUris = useMemo(
    () => identifyingFeatureImageUrisRaw || [],
    [identifyingFeatureImageUrisRaw],
  );
  const schoolDaycareType = watch("schoolDaycareType");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const viewShotRef = React.createRef<ViewShot>();
  const [captureData, setCaptureData] = useState<ChildFormData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (hasBirthmarks !== "yes" && birthmarkImageUris.length > 0) {
      setValue("birthmarkImageUris", [], { shouldDirty: true });
    }
  }, [hasBirthmarks, birthmarkImageUris, setValue]);

  useEffect(() => {
    if (hasScars !== "yes" && scarImageUris.length > 0) {
      setValue("scarImageUris", [], { shouldDirty: true });
    }
  }, [hasScars, scarImageUris, setValue]);

  useEffect(() => {
    if (
      hasIdentifyingFeatures !== "yes" &&
      identifyingFeatureImageUris.length > 0
    ) {
      setValue("identifyingFeatureImageUris", [], { shouldDirty: true });
    }
  }, [hasIdentifyingFeatures, identifyingFeatureImageUris, setValue]);

  const normalizeChildForEdit = useCallback((raw: any): ChildFormData => {
    const toText = (value: unknown) =>
      typeof value === "string" ? value : value == null ? "" : String(value);
    const toOptionalNumber = (value: unknown): number | undefined => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const num = Number(trimmed);
        return Number.isFinite(num) ? num : undefined;
      }
      return undefined;
    };

    const fullName = toText(raw.fullName).trim();
    const splitName = fullName ? fullName.split(/\s+/) : [];
    const fallbackFirstName = splitName[0] || "";
    const fallbackLastName = splitName.slice(1).join(" ");

    const guardian1 = raw.guardian1 ?? {
      name: raw.parent1Name,
      phone: raw.parent1Phone,
      address: raw.parent1Address,
    };

    const guardian2 = raw.guardian2 ?? {
      name: raw.parent2Name,
      phone: raw.parent2Phone,
      address: raw.parent2Address,
    };

    return {
      firstName: toText(raw.firstName).trim() || fallbackFirstName,
      lastName: toText(raw.lastName).trim() || fallbackLastName,
      dateOfBirth: toText(raw.dateOfBirth),
      sex: toText(raw.sex || raw.gender),
      ethnicity: toText(raw.ethnicity),
      skinColor: toText(raw.skinColor),
      skinColorOther: toText(raw.skinColorOther),
      languageSpoken: toText(raw.languageSpoken),
      unitSystem: raw.unitSystem === "metric" ? "metric" : "imperial",
      height: toOptionalNumber(raw.height) as any,
      heightFeet: toOptionalNumber(raw.heightFeet) as any,
      heightInches: toOptionalNumber(raw.heightInches) as any,
      weight: toOptionalNumber(raw.weight) as any,
      hasTrackingDevice: toText(raw.hasTrackingDevice),
      trackingDeviceType: toText(raw.trackingDeviceType),
      trackingDeviceTypeOther: toText(raw.trackingDeviceTypeOther),
      trackingDeviceDetails: toText(raw.trackingDeviceDetails),
      lifeThreatAllergies: toText(raw.lifeThreatAllergies),
      emergencyMedications: toText(raw.emergencyMedications),
      communicationNeeds: toText(raw.communicationNeeds),
      communicationNeedsOther: toText(raw.communicationNeedsOther),
      otherMedicalNotes: toText(raw.otherMedicalNotes || raw.medicalNotes),
      imageUri: toText(raw.imageUri),
      hasBirthmarks: toText(raw.hasBirthmarks) || "no",
      birthmarksDescription: toText(raw.birthmarksDescription),
      hasScars: toText(raw.hasScars) || "no",
      scarsDescription: toText(raw.scarsDescription),
      hasIdentifyingFeatures: toText(raw.hasIdentifyingFeatures) || "no",
      identifyingFeaturesDescription: toText(
        raw.identifyingFeaturesDescription,
      ),
      birthmarkImageUris: Array.isArray(raw.birthmarkImageUris)
        ? raw.birthmarkImageUris
        : [],
      scarImageUris: Array.isArray(raw.scarImageUris) ? raw.scarImageUris : [],
      identifyingFeatureImageUris: Array.isArray(
        raw.identifyingFeatureImageUris,
      )
        ? raw.identifyingFeatureImageUris
        : [],
      lastKnownLocation: toText(raw.lastKnownLocation),
      schoolDaycareType: toText(raw.schoolDaycareType) || "none",
      schoolDaycareName: toText(raw.schoolDaycareName),
      sportsTeams: toText(raw.sportsTeams),
      guardian1: {
        name: toText(guardian1?.name),
        phone: toText(guardian1?.phone),
        address: toText(guardian1?.address),
      },
      guardian2: {
        name: toText(guardian2?.name),
        phone: toText(guardian2?.phone),
        address: toText(guardian2?.address),
      },
      emergencyContacts: Array.isArray(raw.emergencyContacts)
        ? raw.emergencyContacts.map((contact: any) => ({
            name: toText(contact?.name),
            relationship: toText(contact?.relationship),
            phone: toText(contact?.phone),
            address: toText(contact?.address),
          }))
        : [],
      eyeColor: toText(raw.eyeColor),
      eyeColorOther: toText(raw.eyeColorOther),
      hairColor: toText(raw.hairColor),
      hairColorOther: toText(raw.hairColorOther),
      hairStyle: toText(raw.hairStyle),
      hasHat: !!raw.hasHat,
      hatColor: toText(raw.hatColor),
      hatStyle: toText(raw.hatStyle),
      topColor: toText(raw.topColor),
      pantsColor: toText(raw.pantsColor),
      shoesColor: toText(raw.shoesColor),
      shoesType: toText(raw.shoesType),
      hasGlasses: !!raw.hasGlasses,
      hasHearingAids: !!raw.hasHearingAids,
      otherSensoryNeeds: toText(raw.otherSensoryNeeds),
    };
  }, []);

  // ─── Data Handlers ────────────────────────────────────────────────────────
  const loadChildForEdit = useCallback(
    async (childId: string) => {
      try {
        const json = await AsyncStorage.getItem("children_list");
        if (json) {
          const list = JSON.parse(json);
          const child = list.find((c: any) => c.id === childId);
          if (child) {
            reset(normalizeChildForEdit(child), { keepDefaultValues: false });
          }
        }
      } catch (error) {
        console.error("Error loading child:", error);
      }
    },
    [normalizeChildForEdit, reset],
  );

  useEffect(() => {
    if (isEditMode && id) loadChildForEdit(id);
  }, [id, isEditMode, loadChildForEdit]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    confirmDiscard(() => router.back());
  };

  const getStep1PhysicalFields = (): (keyof ChildFormData)[] => {
    const unit = getValues("unitSystem");
    return unit === "metric"
      ? ["height", "weight"]
      : ["heightFeet", "heightInches", "weight"];
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const staticFields = STEP_FIELDS[step];

    if (step !== 1 && staticFields.length === 0) return true;

    // Always run trigger on Zod-validated fields first so all inline errors appear
    const zodValid = staticFields.length > 0
      ? await trigger(staticFields as any)
      : true;

    // For physical + "other" fields on step 1, do manual checks since Zod marks them optional
    if (step === 1) {
      let manualError = false;
      const unit = getValues("unitSystem");
      if (unit === "metric") {
        // Clear imperial-only fields so stale errors don't persist
        clearErrors(["heightFeet", "heightInches"]);
        const h = getValues("height");
        const w = getValues("weight");
        if (h === undefined || h === null || String(h).trim() === "") {
          manualError = true;
          setError("height", { type: "manual", message: "Height (cm) is required" });
        }
        if (w === undefined || w === null || String(w).trim() === "") {
          manualError = true;
          setError("weight", { type: "manual", message: "Weight (kg) is required" });
        }
      } else {
        // Clear metric-only fields so stale errors don't persist
        clearErrors(["height"]);
        const ft = getValues("heightFeet");
        const inches = getValues("heightInches");
        const w = getValues("weight");
        if (ft === undefined || ft === null || String(ft).trim() === "") {
          manualError = true;
          setError("heightFeet", { type: "manual", message: "Height (ft) is required" });
        }
        if (inches === undefined || inches === null || String(inches).trim() === "") {
          manualError = true;
          setError("heightInches", { type: "manual", message: "Height (in) is required" });
        }
        if (w === undefined || w === null || String(w).trim() === "") {
          manualError = true;
          setError("weight", { type: "manual", message: "Weight (lbs) is required" });
        }
      }

      const skinColorVal = getValues("skinColor");
      if (skinColorVal === "other") {
        const v = getValues("skinColorOther");
        if (!v || String(v).trim() === "") {
          manualError = true;
          setError("skinColorOther", { type: "manual", message: "Please describe the skin color" });
        }
      }

      const eyeColorVal = getValues("eyeColor");
      if (eyeColorVal === "other") {
        const v = getValues("eyeColorOther");
        if (!v || String(v).trim() === "") {
          manualError = true;
          setError("eyeColorOther", { type: "manual", message: "Please describe the eye color" });
        }
      }

      const hairColorVal = getValues("hairColor");
      if (hairColorVal === "other") {
        const v = getValues("hairColorOther");
        if (!v || String(v).trim() === "") {
          manualError = true;
          setError("hairColorOther", { type: "manual", message: "Please describe the hair color" });
        }
      }

      return zodValid && !manualError;
    }

    return zodValid;
  };

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (!valid) return;
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep(currentStep + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleStepPress = async (step: number) => {
    if (step === currentStep) return;
    if (step < currentStep) {
      setCurrentStep(step);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    for (let s = currentStep; s < step; s++) {
      const valid = await validateStep(s);
      if (!valid) return;
      if (!completedSteps.includes(s)) {
        setCompletedSteps((prev) => [...prev, s]);
      }
    }
    setCurrentStep(step);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;
    Alert.alert("Delete Child Profile", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const json = await AsyncStorage.getItem("children_list");
            if (json) {
              const list = JSON.parse(json).filter((c: any) => c.id !== id);
              await AsyncStorage.setItem("children_list", JSON.stringify(list));
              Alert.alert("Success", "Child profile deleted");
              router.back();
            }
          } catch {
            Alert.alert("Error", "Failed to delete");
          }
        },
      },
    ]);
  };

  const onSubmit = async (data: ChildFormData) => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()))
        age--;

      const record = {
        ...data,
        fullName,
        age,
        lastUpdated: new Date().toISOString(),
      };

      const json = await AsyncStorage.getItem("children_list");
      let list = json ? JSON.parse(json) : [];
      if (isEditMode && id) {
        const idx = list.findIndex((c: any) => c.id === id);
        if (idx !== -1) {
          list[idx] = { ...record, id };
        } else {
          Alert.alert("Error", "Child profile not found");
          return;
        }
      } else {
        list.push({ ...record, id: Date.now().toString() });
      }
      await AsyncStorage.setItem("children_list", JSON.stringify(list));
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Failed to save data");
    }
  };

  const handleSave = async () => {
    const fields = STEP_FIELDS[currentStep];
    if (fields.length > 0) {
      const valid = await trigger(fields as any);
      if (!valid) return;
    }
    const data = getValues();
    await onSubmit(data);
  };

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to add a profile picture.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setValue("imageUri", result.assets[0].uri, { shouldDirty: true });
    }
  };

  const pickFeatureImages = async (
    fieldName: FeatureImageFieldName,
    existing: string[],
  ) => {
    if (existing.length >= 3) {
      Alert.alert("Limit reached", "You can upload up to 3 photos.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to upload identifying feature images.",
      );
      return;
    }

    const remaining = 3 - existing.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.6,
    });

    if (!result.canceled) {
      const newUris = result.assets
        .map((asset) => asset.uri)
        .slice(0, remaining);
      setValue(fieldName, [...existing, ...newUris], { shouldDirty: true });
    }
  };

  const removeFeatureImage = (
    fieldName: FeatureImageFieldName,
    existing: string[],
    imageIndex: number,
  ) => {
    const nextImages = existing.filter((_, index) => index !== imageIndex);
    setValue(fieldName, nextImages, { shouldDirty: true });
  };

  const renderFeatureUploader = (
    fieldName: FeatureImageFieldName,
    images: string[],
    label: string,
  ) => (
    <View style={styles.featurePhotosContainer}>
      <AppText variant="fieldLabel">{label}</AppText>
      <View style={styles.featurePhotosRow}>
        {images.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.featurePhotoItem}>
            <Image source={{ uri }} style={styles.featurePhotoThumb} />
            <TouchableOpacity
              onPress={() => removeFeatureImage(fieldName, images, index)}
              style={styles.featurePhotoRemoveButton}
              activeOpacity={0.8}
            >
              <AppText style={styles.featurePhotoRemoveText}>×</AppText>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 3 && (
          <TouchableOpacity
            onPress={() => pickFeatureImages(fieldName, images)}
            style={styles.featurePhotoAddButton}
            activeOpacity={0.8}
          >
            <AppText style={styles.featurePhotoAddText}>+ Photo</AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const sanitizeForFileSystem = (value: string) => {
    const clean = value.trim().replace(/[^a-z0-9-_]+/gi, "_");
    return clean.length ? clean.slice(0, 40) : "child";
  };

  const exportImage = handleSubmit(async (data: ChildFormData) => {
    setIsExporting(true);
    try {
      setCaptureData(data);
      await new Promise((r) => setTimeout(r, 30));
      if (!viewShotRef.current) throw new Error("Capture view not ready");
      const uri = await captureRef(viewShotRef, { format: "png", quality: 1 });
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access.");
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(uri);
      const albumName = `ChildGuardID - ${sanitizeForFileSystem(data.firstName)}`;
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album)
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      else await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      Alert.alert("Saved", `Image saved to: ${albumName}`);
    } catch {
      Alert.alert("Error", "Could not export image.");
    } finally {
      setIsExporting(false);
    }
  });

  // ─── DOB picker handler ───────────────────────────────────────────────────
  const handleDateConfirm = (date: Date) => {
    const formatted = date.toISOString().split("T")[0]; // YYYY-MM-DD
    setValue("dateOfBirth", formatted, { shouldValidate: false });
    setShowDatePicker(false);
  };

  // ─── Step titles ──────────────────────────────────────────────────────────
  const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: "Essential ID", subtitle: "Basic identification information" },
    2: { title: "Medical", subtitle: "Health and communication needs" },
    3: { title: "Contacts", subtitle: "Guardians and emergency contacts" },
    4: { title: "Identification", subtitle: "Appearance and identifiers" },
  };

  // ─── Step Renders ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <FormSection title="Profile Photo" subtitle="Optional">
        <View style={styles.profilePhotoWrap}>
          <TouchableOpacity
            onPress={pickProfileImage}
            style={styles.photoUploadCircle}
            activeOpacity={0.85}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
            ) : (
              <AppText style={styles.photoUploadText}>Tap to Add Photo</AppText>
            )}
          </TouchableOpacity>
        </View>
      </FormSection>

      <FormSection title="Identity" subtitle="All fields required">
        <View style={styles.row}>
          <FormField
            control={control}
            name="firstName"
            label="First Name"
            placeholder="First name"
            error={errors.firstName?.message}
            containerStyle={{ flex: 1 }}
          />
          <FormField
            control={control}
            name="lastName"
            label="Last Name"
            placeholder="Last name"
            error={errors.lastName?.message}
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* DOB — calendar picker */}
        <View style={{ marginBottom: 24 }}>
          <AppText variant="fieldLabel">Date of Birth</AppText>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              !!errors.dateOfBirth && styles.datePickerButtonError,
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <AppText
              style={
                dateOfBirth
                  ? styles.datePickerText
                  : styles.datePickerPlaceholder
              }
            >
              {dateOfBirth || "Select date of birth"}
            </AppText>
            <MaterialIcons
              name="calendar-month"
              size={22}
              color={colors.textSubtle}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
          {errors.dateOfBirth && (
            <AppText variant="error">{errors.dateOfBirth.message}</AppText>
          )}
        </View>

        <DatePickerModal
          isVisible={showDatePicker}
          currentValue={dateOfBirth}
          maximumDate={new Date()}
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Sex dropdown */}
        <AppDropdown
          control={control}
          name="sex"
          label="Sex"
          options={SEX_OPTIONS}
          placeholder="Select sex"
          error={errors.sex?.message}
        />

        {/* Ethnicity — free text */}
        <FormField
          control={control}
          name="ethnicity"
          label="Ethnicity"
          placeholder="e.g. Hispanic, Black, Asian, White, Mixed..."
          error={errors.ethnicity?.message}
        />

        {/* Skin Color */}
        <AppDropdown
          control={control}
          name="skinColor"
          label="Skin Color"
          options={SKIN_COLOR_OPTIONS}
          placeholder="Select"
          error={errors.skinColor?.message}
        />
        {skinColor === "other" && (
          <FormField
            control={control}
            name="skinColorOther"
            label="Describe Skin Color"
            placeholder="Enter skin color"
            error={errors.skinColorOther?.message}
          />
        )}

        {/* Language(s) Spoken */}
        <FormField
          control={control}
          name="languageSpoken"
          label="Language(s) Spoken"
          placeholder="e.g. English, Spanish, Mandarin"
          error={errors.languageSpoken?.message}
        />
      </FormSection>

      <FormSection title="Physical" subtitle="All fields required">
        <View style={styles.toggleRow}>
          <AppText style={styles.toggleLabel}>Units</AppText>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[
                styles.unitToggleButton,
                unitSystem === "imperial" && styles.unitToggleButtonActive,
              ]}
              onPress={() => setValue("unitSystem", "imperial")}
            >
              <AppText
                style={[
                  styles.unitToggleText,
                  unitSystem === "imperial" && styles.unitToggleTextActive,
                ]}
              >
                ft / lbs
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitToggleButton,
                unitSystem === "metric" && styles.unitToggleButtonActive,
              ]}
              onPress={() => setValue("unitSystem", "metric")}
            >
              <AppText
                style={[
                  styles.unitToggleText,
                  unitSystem === "metric" && styles.unitToggleTextActive,
                ]}
              >
                cm / kg
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {unitSystem === "imperial" ? (
          <View style={styles.row}>
            <FormField
              control={control}
              name="heightFeet"
              label="Height (ft)"
              placeholder="e.g. 4"
              keyboardType="numeric"
              error={errors.heightFeet?.message}
              containerStyle={{ flex: 1 }}
            />
            <FormField
              control={control}
              name="heightInches"
              label="Height (in)"
              placeholder="e.g. 2"
              keyboardType="numeric"
              error={errors.heightInches?.message}
              containerStyle={{ flex: 1 }}
            />
            <FormField
              control={control}
              name="weight"
              label="Weight (lbs)"
              placeholder="e.g. 55"
              keyboardType="numeric"
              error={errors.weight?.message}
              containerStyle={{ flex: 1 }}
            />
          </View>
        ) : (
          <View style={styles.row}>
            <FormField
              control={control}
              name="height"
              label="Height (cm)"
              placeholder="e.g. 120"
              keyboardType="numeric"
              error={errors.height?.message}
              containerStyle={{ flex: 1 }}
            />
            <FormField
              control={control}
              name="weight"
              label="Weight (kg)"
              placeholder="e.g. 25"
              keyboardType="numeric"
              error={errors.weight?.message}
              containerStyle={{ flex: 1 }}
            />
          </View>
        )}
      </FormSection>

      <FormSection title="Hair & Eyes" subtitle="All fields required">
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppDropdown
              control={control}
              name="eyeColor"
              label="Eye Color"
              options={EYE_COLOR_OPTIONS}
              placeholder="Select"
              error={errors.eyeColor?.message}
            />
            {eyeColor === "other" && (
              <FormField
                control={control}
                name="eyeColorOther"
                label="Describe Eye Color"
                placeholder="Enter eye color"
                error={errors.eyeColorOther?.message}
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <AppDropdown
              control={control}
              name="hairColor"
              label="Hair Color"
              options={HAIR_COLOR_OPTIONS}
              placeholder="Select"
              error={errors.hairColor?.message}
            />
            {hairColor === "other" && (
              <FormField
                control={control}
                name="hairColorOther"
                label="Describe Hair Color"
                placeholder="Enter hair color"
                error={errors.hairColorOther?.message}
              />
            )}
          </View>
        </View>
        <FormField
          control={control}
          name="hairStyle"
          label="Hair Style"
          placeholder="e.g. Short, Curly, Braids, Ponytail"
          error={errors.hairStyle?.message}
        />
      </FormSection>
    </>
  );

  const renderStep2 = () => (
    <>
      <FormSection title="Medical Info" subtitle="Allergies and medications required">
        <FormField
          control={control}
          name="lifeThreatAllergies"
          label="Life-Threatening Allergies"
          placeholder="e.g. Peanuts, Bee stings — leave N/A if none"
          multiline
          numberOfLines={3}
          error={errors.lifeThreatAllergies?.message}
        />
        <FormField
          control={control}
          name="emergencyMedications"
          label="Emergency Medications"
          placeholder="e.g. EpiPen, Inhaler — leave N/A if none"
          multiline
          numberOfLines={3}
          error={errors.emergencyMedications?.message}
        />
        <AppDropdown
          control={control}
          name="communicationNeeds"
          label="Communication Needs"
          options={COMMUNICATION_OPTIONS}
          placeholder="Select"
        />
        {communicationNeeds === "other" && (
          <FormField
            control={control}
            name="communicationNeedsOther"
            label="Describe Communication Needs"
            placeholder="Describe the communication needs"
          />
        )}
        <FormField
          control={control}
          name="otherMedicalNotes"
          label="Other Medical Notes"
          placeholder="Any other relevant medical information"
          multiline
          numberOfLines={4}
        />
      </FormSection>

      <FormSection title="Sensory Needs" subtitle="All optional">
        <View style={styles.toggleRow}>
          <AppText style={styles.toggleLabel}>Wears glasses?</AppText>
          <Switch
            value={hasGlasses ?? false}
            onValueChange={(v) => setValue("hasGlasses", v)}
            trackColor={{ false: colors.cardBorder, true: colors.secondary }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.toggleRow}>
          <AppText style={styles.toggleLabel}>Wears hearing aids?</AppText>
          <Switch
            value={hasHearingAids ?? false}
            onValueChange={(v) => setValue("hasHearingAids", v)}
            trackColor={{ false: colors.cardBorder, true: colors.secondary }}
            thumbColor={colors.white}
          />
        </View>
        <FormField
          control={control}
          name="otherSensoryNeeds"
          label="Other Sensory Needs"
          placeholder="e.g. Wheelchair, walking aid, sensory bracelet"
          multiline
          numberOfLines={3}
        />
      </FormSection>
    </>
  );

  const renderStep3 = () => (
    <>
      <FormSection
        title="Primary Contact 1"
        subtitle="Name, phone and address required"
      >
        <FormField
          control={control}
          name="guardian1.name"
          label="Full Name"
          placeholder="Enter full name"
          error={errors.guardian1?.name?.message}
        />
        <FormField
          control={control}
          name="guardian1.phone"
          label="Phone Number"
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.guardian1?.phone?.message}
        />
        <FormField
          control={control}
          name="guardian1.address"
          label="Address"
          placeholder="Enter address"
          error={errors.guardian1?.address?.message}
        />
      </FormSection>

      <FormSection
        title="Primary Contact 2"
        subtitle="Name and phone required"
      >
        <FormField
          control={control}
          name="guardian2.name"
          label="Full Name"
          placeholder="Enter full name"
          error={errors.guardian2?.name?.message}
        />
        <FormField
          control={control}
          name="guardian2.phone"
          label="Phone Number"
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.guardian2?.phone?.message}
        />
        <FormField
          control={control}
          name="guardian2.address"
          label="Address (Recommended)"
          placeholder="Enter address"
        />
      </FormSection>

      <FormSection
        title="Additional Emergency Contacts"
        subtitle="Optional — must not be a primary contact"
      >
        {fields.map((field, index) => (
          <View key={field.id} style={styles.contactCard}>
            <View style={styles.contactCardHeader}>
              <AppText style={styles.contactCardTitle}>
                Contact {index + 1}
              </AppText>
              <TouchableOpacity onPress={() => remove(index)}>
                <AppText style={styles.removeContactText}>Remove</AppText>
              </TouchableOpacity>
            </View>
            <FormField
              control={control}
              name={`emergencyContacts.${index}.name` as any}
              label="Full Name"
              placeholder="Enter name"
              error={errors.emergencyContacts?.[index]?.name?.message}
            />
            <FormField
              control={control}
              name={`emergencyContacts.${index}.relationship` as any}
              label="Relationship"
              placeholder="e.g. Aunt, Family Friend"
              error={errors.emergencyContacts?.[index]?.relationship?.message}
            />
            <FormField
              control={control}
              name={`emergencyContacts.${index}.phone` as any}
              label="Phone Number"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              error={errors.emergencyContacts?.[index]?.phone?.message}
            />
            <FormField
              control={control}
              name={`emergencyContacts.${index}.address` as any}
              label="Address (Recommended)"
              placeholder="Enter address"
            />
          </View>
        ))}
        {fields.length < 4 && (
          <TouchableOpacity
            onPress={() =>
              append({ name: "", relationship: "", phone: "", address: "" })
            }
            style={sharedStyles.secondaryButton}
          >
            <AppText variant="label" style={sharedStyles.secondaryButtonText}>
              + Add Contact
            </AppText>
          </TouchableOpacity>
        )}
      </FormSection>
    </>
  );

  const renderStep4 = () => (
    <>
    <FormSection title="Clothing" subtitle="All optional">
        <View style={styles.toggleRow}>
          <AppText style={styles.toggleLabel}>Wearing headwear?</AppText>
          <Switch
            value={hasHat ?? false}
            onValueChange={(v) => setValue("hasHat", v)}
            trackColor={{ false: colors.cardBorder, true: colors.secondary }}
            thumbColor={colors.white}
          />
        </View>
        {hasHat && (
          <View style={styles.row}>
            <FormField
              control={control}
              name="hatColor"
              label="Headwear Color"
              placeholder="e.g. Red"
              containerStyle={{ flex: 1 }}
            />
            <FormField
              control={control}
              name="hatStyle"
              label="Headwear Type"
              placeholder="e.g. Baseball cap"
              containerStyle={{ flex: 1 }}
            />
          </View>
        )}
        <FormField
          control={control}
          name="topColor"
          label="Top / Shirt"
          placeholder="e.g. Blue hoodie, white t-shirt"
        />
        <FormField
          control={control}
          name="pantsColor"
          label="Pants / Bottom"
          placeholder="e.g. Dark jeans, grey leggings"
        />
        <View style={styles.row}>
          <FormField
            control={control}
            name="shoesColor"
            label="Shoes Color"
            placeholder="e.g. White"
            containerStyle={{ flex: 1 }}
          />
          <FormField
            control={control}
            name="shoesType"
            label="Shoes Type"
            placeholder="e.g. Sneakers"
            containerStyle={{ flex: 1 }}
          />
        </View>
      </FormSection>

      <FormSection
        title="Identifying Features"
        subtitle="All fields optional"
      >
        <AppDropdown
          control={control}
          name="hasBirthmarks"
          label="Does your child have any birthmarks?"
          options={YES_NO_OPTIONS}
          placeholder="Select"
        />
        {hasBirthmarks === "yes" && (
          <>
            <FormField
              control={control}
              name="birthmarksDescription"
              label="Describe Birthmarks"
              placeholder="Describe location and appearance"
              multiline
              numberOfLines={3}
            />
            {renderFeatureUploader(
              "birthmarkImageUris",
              birthmarkImageUris,
              "Birthmark Photos (Optional, up to 3)",
            )}
          </>
        )}

        <AppDropdown
          control={control}
          name="hasScars"
          label="Does your child have any scars?"
          options={YES_NO_OPTIONS}
          placeholder="Select"
        />
        {hasScars === "yes" && (
          <>
            <FormField
              control={control}
              name="scarsDescription"
              label="Describe Scars"
              placeholder="Describe location and appearance"
              multiline
              numberOfLines={3}
            />
            {renderFeatureUploader(
              "scarImageUris",
              scarImageUris,
              "Scar Photos (Optional, up to 3)",
            )}
          </>
        )}

        <AppDropdown
          control={control}
          name="hasIdentifyingFeatures"
          label="Any other key identifying features?"
          options={YES_NO_OPTIONS}
          placeholder="Select"
        />
        {hasIdentifyingFeatures === "yes" && (
          <>
            <FormField
              control={control}
              name="identifyingFeaturesDescription"
              label="Describe Additional Features"
              placeholder="e.g. mole, birth defect, tattoos"
              multiline
              numberOfLines={3}
            />
            {renderFeatureUploader(
              "identifyingFeatureImageUris",
              identifyingFeatureImageUris,
              "Additional Feature Photos (Optional, up to 3)",
            )}
          </>
        )}

        <FormField
          control={control}
          name="lastKnownLocation"
          label="Last Known Location"
          placeholder="e.g. School playground, community center"
        />

        <AppDropdown
          control={control}
          name="schoolDaycareType"
          label="Is your child in school or daycare?"
          options={[
            { label: "School", value: "school" },
            { label: "Daycare", value: "daycare" },
            { label: "None", value: "none" },
          ]}
          placeholder="Select"
        />
        {schoolDaycareType && schoolDaycareType !== "none" && (
          <FormField
            control={control}
            name="schoolDaycareName"
            label={
              schoolDaycareType === "school" ? "School Name" : "Daycare Name"
            }
            placeholder="Enter name"
          />
        )}

        <FormField
          control={control}
          name="sportsTeams"
          label="Sports Teams"
          placeholder="Optional"
        />
      </FormSection>

      <FormSection title="Tracking Device" subtitle="Optional">
        <AppDropdown
          control={control}
          name="hasTrackingDevice"
          label="Does your child have a tracking device?"
          options={YES_NO_OPTIONS}
          placeholder="Select"
        />
        {hasTrackingDevice === "yes" && (
          <>
            <AppDropdown
              control={control}
              name="trackingDeviceType"
              label="Device Type"
              options={TRACKING_DEVICE_OPTIONS}
              placeholder="Select"
            />
            {trackingDeviceType === "other" && (
              <FormField
                control={control}
                name="trackingDeviceTypeOther"
                label="Describe Device"
                placeholder="Enter device type"
              />
            )}
            <FormField
              control={control}
              name="trackingDeviceDetails"
              label="Device Details (Optional)"
              placeholder="e.g. iPhone 15 in blue case, Apple Watch on left wrist"
            />
          </>
        )}
      </FormSection>
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      {/* Frozen header — outside scroll so it never moves */}
      <ScreenHeader
        title={isEditMode ? "Edit Profile" : stepTitles[currentStep].title}
        subtitle={
          isEditMode
            ? "Update child information"
            : stepTitles[currentStep].subtitle
        }
        onLeftPress={handleBack}
        onRightPress={() => confirmDiscard(() => router.replace("/(tabs)"))}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.container,
            { paddingBottom: BOTTOM_OFFSET + 20 },
          ]}
        >
          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <View style={styles.navButtonRow}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.navButtonBack}
                onPress={handleBack}
              >
                <AppText style={styles.navButtonBackText}>← Back</AppText>
              </TouchableOpacity>
            )}
            {currentStep < 4 && !isEditMode ? (
              <TouchableOpacity
                style={styles.navButtonNext}
                onPress={handleNext}
              >
                <AppText style={styles.navButtonNextText}>Next →</AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.navButtonNext,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSave}
              >
                <AppText style={styles.navButtonNextText}>
                  {isEditMode ? "Update Profile" : "Save Profile"}
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* Export + Delete (last step or edit mode) */}
          {(currentStep === 4 || isEditMode) && (
            <>
              <TouchableOpacity
                style={[
                  sharedStyles.secondaryButton,
                  styles.exportButton,
                  isExporting && styles.disabledButton,
                ]}
                onPress={exportImage}
                disabled={isExporting}
              >
                <AppText
                  variant="label"
                  style={sharedStyles.secondaryButtonText}
                >
                  {isExporting ? "Working..." : "Export Image"}
                </AppText>
              </TouchableOpacity>
              {isEditMode && (
                <TouchableOpacity
                  style={sharedStyles.dangerButton}
                  onPress={handleDelete}
                >
                  <AppText
                    variant="label"
                    style={sharedStyles.dangerButtonText}
                  >
                    Delete Profile
                  </AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        {/* Hidden export card */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1 }}
          style={styles.hiddenCapture}
        >
          <View style={styles.captureCard}>
            <AppText variant="heading" style={styles.captureTitle}>
              Child Guard ID
            </AppText>
            <AppText variant="label" style={styles.captureName}>
              {`${captureData?.firstName || ""} ${captureData?.lastName || ""}`.trim() ||
                "Name missing"}
            </AppText>
            {[
              ["Date of Birth", captureData?.dateOfBirth],
              ["Sex", captureData?.sex],
              ["Ethnicity", captureData?.ethnicity],
              ["Height", captureData?.unitSystem === "metric"
                ? (captureData?.height != null ? `${captureData.height} cm` : undefined)
                : (captureData?.heightFeet != null ? `${captureData.heightFeet} ft ${captureData.heightInches ?? 0} in` : undefined)],
              [captureData?.unitSystem === "metric" ? "Weight (kg)" : "Weight (lbs)", captureData?.weight],
            ].map(([label, value]) =>
              value ? (
                <View key={label as string} style={styles.captureRow}>
                  <AppText style={styles.captureLabel}>{label}</AppText>
                  <AppText style={styles.captureValue}>{String(value)}</AppText>
                </View>
              ) : null,
            )}
            {captureData?.lifeThreatAllergies && (
              <>
                <AppText style={styles.captureSection}>Medical</AppText>
                <AppText style={styles.captureNotes}>
                  {captureData.lifeThreatAllergies}
                </AppText>
              </>
            )}
            {captureData?.guardian1?.name && (
              <>
                <AppText style={styles.captureSection}>Primary Contact 1</AppText>
                <AppText style={styles.captureNotes}>
                  {captureData.guardian1.name} — {captureData.guardian1.phone}
                </AppText>
              </>
            )}
            {captureData?.emergencyContacts?.map((c, i) => (
              <View key={i}>
                <AppText style={styles.captureSection}>
                  Emergency Contact {i + 1}
                </AppText>
                <AppText style={styles.captureNotes}>
                  {c.name} ({c.relationship}) — {c.phone}
                </AppText>
              </View>
            ))}
          </View>
        </ViewShot>
      </KeyboardAvoidingView>

      {/* Progress bar — outside KeyboardAvoidingView so keyboard never shifts it */}
      {!keyboardVisible && (
        <View
          style={[styles.progressBarWrapper, { bottom: insets.bottom - 20 }]}
        >
          <StepProgressBar
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepPress={handleStepPress}
          />
        </View>
      )}
    </View>
  );
}
