import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Controller,
  useFieldArray,
  useForm,
} from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot, {
  captureRef,
} from "react-native-view-shot";
import { z } from "zod";

import { AppDropdown } from "@/components/ui/app-dropdown";
import { AppText } from "@/components/ui/app-text";
import { FormField } from "@/components/ui/form-field";
import {
  sharedStyles,
  addChildStyles as styles,
} from "@/styles";

// ─── Validation Schema ────────────────────────────────────────────────────────
const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z
    .string()
    .min(1, "Relationship is required"),
  sex: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
});

// Helper for numeric coercion to prevent empty strings from defaulting to 0
const numericField = (
  minVal: number,
  maxVal: number,
  label: string,
) =>
  z
    .string()
    .transform((val) => {
      const trimmed = val.trim();
      if (trimmed === "") return undefined;
      const num = Number(trimmed);
      if (isNaN(num))
        throw new Error(
          `${label} must be a number`,
        );
      if (num < minVal)
        throw new Error(`${label} seems too low`);
      if (num > maxVal)
        throw new Error(
          `${label} seems too high`,
        );
      return num;
    })
    .optional()
    .refine((val) => val !== undefined, {
      message: `${label} is required`,
    });

const childSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters"),
  imageUri: z.string().optional(),
  age: numericField(0, 18, "Age"),
  height: numericField(30, 250, "Height"),
  weight: numericField(2, 200, "Weight"),
  gender: z.string().optional(),
  medicalNotes: z
    .string()
    .max(300, "Notes too long")
    .optional(),
  hasBirthmarks: z.string().optional(),
  birthmarksDescription: z.string().optional(),
  hasScars: z.string().optional(),
  scarsDescription: z.string().optional(),
  hasIdentifyingFeatures: z.string().optional(),
  identifyingFeaturesDescription: z
    .string()
    .optional(),
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

type ChildFormData = z.infer<typeof childSchema>;

export default function AddChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();
  const isEditMode = !!id;
  const viewShotRef = useRef<ViewShot>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema as any),
    defaultValues: {
      fullName: "",
      imageUri: "",
      gender: "",
      medicalNotes: "",
      emergencyContacts: [
        {
          name: "",
          relationship: "",
          sex: "",
          phone: "",
          address: "",
        },
      ],
    },
  });

  const [captureData, setCaptureData] =
    useState<ChildFormData | null>(null);
  const [isExporting, setIsExporting] =
    useState(false);

  // Watch fields for conditional rendering
  const watchedFields = watch([
    "hasBirthmarks",
    "hasScars",
    "hasIdentifyingFeatures",
    "schoolDaycareType",
    "imageUri",
  ]);
  const [
    hasBirthmarks,
    hasScars,
    hasIdentifyingFeatures,
    schoolDaycareType,
    imageUri,
  ] = watchedFields;

  const { fields, append, remove } =
    useFieldArray({
      control,
      name: "emergencyContacts",
    });

  useEffect(() => {
    if (isEditMode && id) loadChildForEdit(id);
  }, [id, isEditMode]);

  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to add a profile picture.",
      );
      return;
    }
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    if (!result.canceled)
      setValue("imageUri", result.assets[0].uri, {
        shouldDirty: true,
      });
  };

  const loadChildForEdit = async (
    childId: string,
  ) => {
    try {
      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      if (childrenJson) {
        const childrenList =
          JSON.parse(childrenJson);
        const child = childrenList.find(
          (c: any) => c.id === childId,
        );
        if (child) reset(child);
      }
    } catch (error) {
      console.error(
        "Error loading child:",
        error,
      );
    }
  };

  const onInvalid = (errors: any) => {
    console.log('Form validation errors:', errors);
    Alert.alert("Validation Error", "Please check the form for errors.");
  };
      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      let childrenList = childrenJson
        ? JSON.parse(childrenJson)
        : [];

      if (isEditMode && id) {
        const index = childrenList.findIndex(
          (c: any) => c.id === id,
        );
        if (index !== -1)
          childrenList[index] = { ...data, id };
      } else {
        childrenList.push({
          ...data,
          id: Date.now().toString(),
        });
      }

      await AsyncStorage.setItem(
        "children_list",
        JSON.stringify(childrenList),
      );
      console.log('Profile saved successfully');
      Alert.alert("Success", "Profile saved!");
      router.back();
    } catch (e) {
      console.log('Error saving profile:', e);
      Alert.alert("Error", "Failed to save data");
    }
  };

  const exportPdfAndImage = handleSubmit(
    async (data) => {
      setIsExporting(true);
      setCaptureData(data as ChildFormData);

      // Delay capture to allow the ViewShot (including any images) to render
      setTimeout(async () => {
        try {
          if (!viewShotRef.current)
            throw new Error(
              "Capture view not ready",
            );
          const uri = await captureRef(
            viewShotRef,
            { format: "png", quality: 1 },
          );

          const permission =
            await MediaLibrary.requestPermissionsAsync();
          if (permission.status === "granted") {
            const asset =
              await MediaLibrary.createAssetAsync(
                uri,
              );
            await MediaLibrary.createAlbumAsync(
              "ChildGuardID",
              asset,
              false,
            );
            Alert.alert(
              "Export Successful",
              "ID Card saved to gallery.",
            );
          }
        } catch (error) {
          Alert.alert(
            "Error",
            "Could not export image.",
          );
        } finally {
          setIsExporting(false);
        }
      }, 600);
    },
  );

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.headerContainer}>
          <AppText variant="heading">
            {isEditMode
              ? "Edit Profile"
              : "Create Profile"}
          </AppText>
        </View>

        {/* Photo Upload Section */}
        <View
          style={{
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          <TouchableOpacity
            onPress={pickImage}
            style={styles.photoUploadCircle}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.photoPreview}
              />
            ) : (
              <AppText
                style={{ textAlign: "center" }}
              >
                Tap to Add Photo
              </AppText>
            )}
          </TouchableOpacity>
        </View>

        <FormField
          control={control}
          name="fullName"
          label="Full Name"
          error={errors.fullName?.message}
        />

        <View style={styles.row}>
          <FormField
            control={control}
            name="age"
            label="Age"
            keyboardType="numeric"
            containerStyle={{
              flex: 1,
              marginRight: 10,
            }}
            error={errors.age?.message}
          />
          <FormField
            control={control}
            name="gender"
            label="Gender"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <View style={styles.row}>
          <FormField
            control={control}
            name="height"
            label="Height (cm)"
            keyboardType="numeric"
            containerStyle={{
              flex: 1,
              marginRight: 10,
            }}
            error={errors.height?.message}
          />
          <FormField
            control={control}
            name="weight"
            label="Weight (kg)"
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
            error={errors.weight?.message}
          />
        </View>

        <FormField
          control={control}
          name="medicalNotes"
          label="Medical Notes"
          multiline
          numberOfLines={4}
          error={errors.medicalNotes?.message}
        />

        {/* Identifying Features */}
        <AppText
          variant="heading"
          style={{ marginTop: 20 }}
        >
          Identifying Features
        </AppText>

        <Controller
          control={control}
          name="hasBirthmarks"
          render={({
            field: { onChange, value },
          }) => (
            <AppDropdown
              label="Birthmarks?"
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
        {hasBirthmarks === "yes" && (
          <FormField
            control={control}
            name="birthmarksDescription"
            label="Details"
            multiline
          />
        )}

        <Controller
          control={control}
          name="hasScars"
          render={({
            field: { onChange, value },
          }) => (
            <AppDropdown
              label="Scars?"
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
        {hasScars === "yes" && (
          <FormField
            control={control}
            name="scarsDescription"
            label="Details"
            multiline
          />
        )}

        <Controller
          control={control}
          name="schoolDaycareType"
          render={({
            field: { onChange, value },
          }) => (
            <AppDropdown
              label="School/Daycare?"
              options={[
                {
                  label: "School",
                  value: "school",
                },
                {
                  label: "Daycare",
                  value: "daycare",
                },
                { label: "None", value: "none" },
              ]}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
        {(schoolDaycareType === "school" ||
          schoolDaycareType === "daycare") && (
          <FormField
            control={control}
            name="schoolDaycareName"
            label="Institution Name"
          />
        )}

        {/* Emergency Contacts */}
        <AppText
          variant="heading"
          style={{ marginTop: 20 }}
        >
          Emergency Contacts
        </AppText>
        {fields.map((field, index) => (
          <View
            key={field.id}
            style={styles.contactCard}
          >
            <FormField
              control={control}
              name={
                `emergencyContacts.${index}.name` as any
              }
              label="Name"
            />
            <FormField
              control={control}
              name={
                `emergencyContacts.${index}.relationship` as any
              }
              label="Relationship"
            />
            <FormField
              control={control}
              name={
                `emergencyContacts.${index}.phone` as any
              }
              label="Phone"
              keyboardType="phone-pad"
            />
            {fields.length > 1 && (
              <TouchableOpacity
                onPress={() => remove(index)}
              >
                <AppText
                  style={{
                    color: "red",
                    marginTop: 5,
                  }}
                >
                  Remove Contact
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {fields.length < 3 && (
          <TouchableOpacity
            onPress={() =>
              append({
                name: "",
                relationship: "",
                phone: "",
              })
            }
            style={sharedStyles.secondaryButton}
          >
            <AppText>+ Add Contact</AppText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={sharedStyles.primaryButton}
          onPress={handleSubmit(onSubmit as any, onInvalid)}
        >
          <AppText
            style={sharedStyles.primaryButtonText}
          >
            Save Profile
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            sharedStyles.secondaryButton,
            isExporting && { opacity: 0.5 },
          ]}
          onPress={exportPdfAndImage}
          disabled={isExporting}
        >
          <AppText>
            {isExporting
              ? "Generating..."
              : "Export ID Card Image"}
          </AppText>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* HIDDEN CAPTURE CARD */}
      <ViewShot
        ref={viewShotRef}
        style={styles.hiddenCapture}
      >
        <View style={styles.captureCard}>
          <AppText style={styles.captureTitle}>
            CHILD GUARD ID
          </AppText>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 20,
            }}
          >
            {captureData?.imageUri && (
              <Image
                source={{
                  uri: captureData.imageUri,
                }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 10,
                  marginRight: 15,
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <AppText style={styles.captureName}>
                {captureData?.fullName}
              </AppText>
              <AppText style={{ fontSize: 16 }}>
                Age: {captureData?.age}
              </AppText>
              <AppText style={{ fontSize: 16 }}>
                H: {captureData?.height}cm | W:{" "}
                {captureData?.weight}kg
              </AppText>
              {captureData?.gender && (
                <AppText style={{ fontSize: 16 }}>
                  Gender: {captureData.gender}
                </AppText>
              )}
            </View>
          </View>
          {captureData?.medicalNotes && (
            <View
              style={{
                borderTopWidth: 1,
                borderColor: "#eee",
                paddingTop: 10,
              }}
            >
              <AppText
                style={{ fontWeight: "bold" }}
              >
                Medical Notes:
              </AppText>
              <AppText numberOfLines={3}>
                {captureData.medicalNotes}
              </AppText>
            </View>
          )}
        </View>
      </ViewShot>
    </KeyboardAvoidingView>
  );
}
