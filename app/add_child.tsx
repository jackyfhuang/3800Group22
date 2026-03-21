import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppDropdown } from "@/components/ui/app-dropdown";
import { AppText } from "@/components/ui/app-text";
import { FormField } from "@/components/ui/form-field";
import { useChildrenStorage } from "@/hooks/useChildrenStorage";
import { sharedStyles, addChildStyles as styles } from "@/styles";
import {
  ChildFormData,
  childSchema,
  getDefaultChildFormData,
} from "@/types/child";

export default function AddChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();
  const isEditMode = !!id;
  const { loadChild, saveOrUpdateChild } = useChildrenStorage();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema as any),
    defaultValues: getDefaultChildFormData(),
  });

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const loadChildForEdit = useCallback(
    async (childId: string) => {
      try {
        const child = await loadChild(childId);
        if (child) reset(child);
      } catch (error) {
        console.error("Error loading child:", error);
      }
    },
    [loadChild, reset],
  );

  useEffect(() => {
    if (isEditMode && id) loadChildForEdit(id);
  }, [id, isEditMode, loadChildForEdit]);

  const pickImage = async () => {
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
    if (!result.canceled)
      setValue("imageUri", result.assets[0].uri, {
        shouldDirty: true,
      });
  };

  const onValid = async (data: ChildFormData) => {
    try {
      const result = await saveOrUpdateChild(data, id);
      if (result) {
        console.log("Profile saved successfully");
        Alert.alert("Success", "Profile saved!");
        router.back();
      } else {
        Alert.alert("Error", "Failed to save data");
      }
    } catch (e) {
      console.log("Error saving profile:", e);
      Alert.alert("Error", "Failed to save data");
    }
  };

  const onInvalid = (errors: any) => {
    console.log("Form validation errors:", errors);
    Alert.alert("Validation Error", "Please check the form for errors.");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerContainer}>
            <AppText variant="heading">
              {isEditMode ? "Edit Profile" : "Create Profile"}
            </AppText>
            <AppText variant="subtitle">
              {isEditMode
                ? "Update child information"
                : "Add a new child profile"}
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
                <Image source={{ uri: imageUri }} style={styles.photoPreview} />
              ) : (
                <AppText style={{ textAlign: "center" }}>
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
              label="Gender (Optional)"
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
          <AppText variant="heading" style={{ marginTop: 20 }}>
            Identifying Features
          </AppText>

          <Controller
            control={control}
            name="hasBirthmarks"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Does your child have any birthmarks?"
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
              label="Describe birthmarks"
              multiline
            />
          )}

          <Controller
            control={control}
            name="hasScars"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Does your child have any scars?"
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
              label="Describe scars"
              multiline
            />
          )}

          <Controller
            control={control}
            name="hasIdentifyingFeatures"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Does your child have any other key identifying features?"
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]}
                value={value}
                onValueChange={onChange}
              />
            )}
          />
          {hasIdentifyingFeatures === "yes" && (
            <FormField
              control={control}
              name="identifyingFeaturesDescription"
              label="Describe identifying features"
              multiline
            />
          )}

          <FormField
            control={control}
            name="lastKnownLocation"
            label="Last Known Location (Optional)"
          />

          <Controller
            control={control}
            name="schoolDaycareType"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Is your child in school or daycare?"
                options={[
                  {
                    label: "School",
                    value: "school",
                  },
                  {
                    label: "Daycare",
                    value: "daycare",
                  },
                  {
                    label: "None",
                    value: "none",
                  },
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
              label={
                schoolDaycareType === "school" ? "School Name" : "Daycare Name"
              }
            />
          )}

          <FormField
            control={control}
            name="sportsTeams"
            label="Sports Teams (Optional)"
          />

          <AppText variant="heading" style={{ marginTop: 20 }}>
            Parents Information
          </AppText>

          <FormField
            control={control}
            name="parent1Name"
            label="Parent 1 - Full Name (Optional)"
          />
          <FormField
            control={control}
            name="parent1Address"
            label="Parent 1 - Address (Optional)"
          />
          <FormField
            control={control}
            name="parent1Phone"
            label="Parent 1 - Phone Number (Optional)"
            keyboardType="phone-pad"
          />

          <FormField
            control={control}
            name="parent2Name"
            label="Parent 2 - Full Name (Optional)"
          />
          <FormField
            control={control}
            name="parent2Address"
            label="Parent 2 - Address (Optional)"
          />
          <FormField
            control={control}
            name="parent2Phone"
            label="Parent 2 - Phone Number (Optional)"
            keyboardType="phone-pad"
          />

          {/* Emergency Contacts */}
          <AppText variant="heading" style={{ marginTop: 20 }}>
            Emergency Contacts (Minimum 1, Maximum 3)
          </AppText>
          {fields.map((field, index) => (
            <View
              key={field.id}
              style={[
                styles.contactCard,
                index > 0 && styles.contactCardWithSeparator,
              ]}
            >
              {fields.length > 1 && (
                <View style={styles.contactCardHeader}>
                  <AppText variant="fieldLabel">Contact {index + 1}</AppText>
                  <TouchableOpacity
                    onPress={() => remove(index)}
                    style={styles.removeContactButton}
                  >
                    <AppText style={styles.removeContactText}>Remove</AppText>
                  </TouchableOpacity>
                </View>
              )}
              <FormField
                control={control}
                name={`emergencyContacts.${index}.name` as any}
                label="Name"
              />
              <FormField
                control={control}
                name={`emergencyContacts.${index}.relationship` as any}
                label="Relationship"
              />
              <FormField
                control={control}
                name={`emergencyContacts.${index}.phone` as any}
                label="Phone"
                keyboardType="phone-pad"
              />
              <FormField
                control={control}
                name={`emergencyContacts.${index}.sex` as any}
                label="Sex (Optional)"
              />
              <FormField
                control={control}
                name={`emergencyContacts.${index}.address` as any}
                label="Address (Optional)"
              />
            </View>
          ))}

          {fields.length < 3 && (
            <TouchableOpacity
              onPress={() =>
                append({
                  name: "",
                  relationship: "",
                  sex: "",
                  phone: "",
                  address: "",
                })
              }
              style={[sharedStyles.secondaryButton, styles.addContactButton]}
            >
              <AppText variant="label" style={sharedStyles.secondaryButtonText}>
                + Add Emergency Contact
              </AppText>
            </TouchableOpacity>
          )}

          {errors.emergencyContacts && (
            <AppText variant="error" style={styles.contactErrorText}>
              {errors.emergencyContacts.message ||
                "At least one emergency contact is required"}
            </AppText>
          )}

          <TouchableOpacity
            style={sharedStyles.primaryButton}
            onPress={handleSubmit(onValid, onInvalid)}
          >
            <AppText style={sharedStyles.primaryButtonText}>
              Save Profile
            </AppText>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
