import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { z } from 'zod';

import { AppDropdown } from '@/components/ui/app-dropdown';
import { AppText } from '@/components/ui/app-text';
import { FormField } from '@/components/ui/form-field';
import { sharedStyles, addChildStyles as styles } from '@/styles';

// ─── Validation Schema ────────────────────────────────────────────────────────
const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  sex: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
});

const childSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce
    .number()
    .min(0, 'Age cannot be negative')
    .max(18, 'Must be under 18'),
  height: z.coerce
    .number()
    .min(30, 'Height (cm) seems too low')
    .max(250, 'Height seems too high'),
  weight: z.coerce.number().min(2, 'Weight (kg) seems too low'),
  gender: z.string().optional(),
  medicalNotes: z
    .string()
    .max(300, 'Notes are too long (max 300 chars)')
    .optional(),
  // Birthmarks and Scars
  hasBirthmarks: z.string().optional(),
  birthmarksDescription: z.string().optional(),
  hasScars: z.string().optional(),
  scarsDescription: z.string().optional(),
  // Other identifying features
  hasIdentifyingFeatures: z.string().optional(),
  identifyingFeaturesDescription: z.string().optional(),
  // Location and School/Daycare
  lastKnownLocation: z.string().optional(),
  schoolDaycareType: z.string().optional(), // 'school', 'daycare', 'none'
  schoolDaycareName: z.string().optional(),
  sportsTeams: z.string().optional(),
  // Parents
  parent1Name: z.string().optional(),
  parent1Address: z.string().optional(),
  parent1Phone: z.string().optional(),
  parent2Name: z.string().optional(),
  parent2Address: z.string().optional(),
  parent2Phone: z.string().optional(),
  // Emergency Contacts (1-3)
  emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
});

type ChildFormData = z.infer<typeof childSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      fullName: '',
      gender: '',
      medicalNotes: '',
      age: undefined,
      height: undefined,
      weight: undefined,
      hasBirthmarks: '',
      birthmarksDescription: '',
      hasScars: '',
      scarsDescription: '',
      hasIdentifyingFeatures: '',
      identifyingFeaturesDescription: '',
      lastKnownLocation: '',
      schoolDaycareType: '',
      schoolDaycareName: '',
      sportsTeams: '',
      parent1Name: '',
      parent1Address: '',
      parent1Phone: '',
      parent2Name: '',
      parent2Address: '',
      parent2Phone: '',
      emergencyContacts: [{ name: '', relationship: '', sex: '', phone: '', address: '' }],
    },
  });

  // Watch conditional fields
  const hasBirthmarks = watch('hasBirthmarks');
  const hasScars = watch('hasScars');
  const hasIdentifyingFeatures = watch('hasIdentifyingFeatures');
  const schoolDaycareType = watch('schoolDaycareType');

  // Emergency contacts field array
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyContacts',
  });

  const viewShotRef = React.createRef<ViewShot>();
  const [captureData, setCaptureData] = React.useState<ChildFormData | null>(
    null,
  );
  const [isExporting, setIsExporting] = React.useState(false);

  useEffect(() => {
    if (isEditMode && id) loadChildForEdit(id);
  }, [id, isEditMode]);

  // ─── Data Handlers ────────────────────────────────────────────────────────
  const loadChildForEdit = async (childId: string) => {
    try {
      const childrenJson = await AsyncStorage.getItem('children_list');
      if (childrenJson) {
        const childrenList = JSON.parse(childrenJson);
        const child = childrenList.find((c: any) => c.id === childId);
        if (child) {
          reset(
            {
              fullName: child.fullName || '',
              age: child.age,
              height: child.height,
              weight: child.weight,
              gender: child.gender || '',
              medicalNotes: child.medicalNotes || '',
              hasBirthmarks: child.hasBirthmarks || '',
              birthmarksDescription: child.birthmarksDescription || '',
              hasScars: child.hasScars || '',
              scarsDescription: child.scarsDescription || '',
              hasIdentifyingFeatures: child.hasIdentifyingFeatures || '',
              identifyingFeaturesDescription: child.identifyingFeaturesDescription || '',
              lastKnownLocation: child.lastKnownLocation || '',
              schoolDaycareType: child.schoolDaycareType || '',
              schoolDaycareName: child.schoolDaycareName || '',
              sportsTeams: child.sportsTeams || '',
              parent1Name: child.parent1Name || '',
              parent1Address: child.parent1Address || '',
              parent1Phone: child.parent1Phone || '',
              parent2Name: child.parent2Name || '',
              parent2Address: child.parent2Address || '',
              parent2Phone: child.parent2Phone || '',
              emergencyContacts: child.emergencyContacts || [{ name: '', relationship: '', sex: '', phone: '', address: '' }],
            },
            { keepDefaultValues: false },
          );
        }
      }
    } catch (error) {
      console.error('Error loading child for edit:', error);
    }
  };

  const handleBack = () => {
    if (!isDirty) return router.back();

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' && window.confirm
          ? window.confirm(
              'Are you sure you want to go back? Your changes will not be saved.',
            )
          : true;
      if (confirmed) router.back();
    } else {
      Alert.alert(
        'Unsaved Changes',
        'Are you sure you want to go back? Your changes will not be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard Changes',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ],
      );
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;

    Alert.alert(
      'Delete Child Profile',
      'Are you sure you want to delete this child profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const childrenJson = await AsyncStorage.getItem('children_list');
              if (childrenJson) {
                const childrenList = JSON.parse(childrenJson);
                const updatedChildren = childrenList.filter(
                  (c: any) => c.id !== id,
                );
                await AsyncStorage.setItem(
                  'children_list',
                  JSON.stringify(updatedChildren),
                );
                Alert.alert('Success', 'Child profile deleted');
                router.back();
              }
            } catch (error) {
              console.error('Error deleting child:', error);
              Alert.alert('Error', 'Failed to delete child profile');
            }
          },
        },
      ],
    );
  };

  const onSubmit = async (data: ChildFormData) => {
    try {
      const childrenJson = await AsyncStorage.getItem('children_list');
      let childrenList = childrenJson ? JSON.parse(childrenJson) : [];

      if (isEditMode && id) {
        const childIndex = childrenList.findIndex((c: any) => c.id === id);
        if (childIndex !== -1) {
          childrenList[childIndex] = { ...data, id };
          Alert.alert('Success', 'Child profile updated!');
        } else {
          Alert.alert('Error', 'Child profile not found');
          return;
        }
      } else {
        childrenList.push({ ...data, id: Date.now().toString() });
        Alert.alert('Success', 'Child profile saved!');
      }

      await AsyncStorage.setItem('children_list', JSON.stringify(childrenList));

      // Migrate old single child format if it exists
      const oldChildJson = await AsyncStorage.getItem('child_profile');
      if (oldChildJson && !isEditMode) {
        const oldChild = JSON.parse(oldChildJson);
        const migratedChild = { ...oldChild, id: (Date.now() + 1).toString() };
        await AsyncStorage.setItem(
          'children_list',
          JSON.stringify([...childrenList, migratedChild]),
        );
        await AsyncStorage.removeItem('child_profile');
      }

      router.back();
    } catch (e) {
      console.error('Save error:', e);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const sanitizeForFileSystem = (value: string) => {
    const clean = value.trim().replace(/[^a-z0-9-_]+/gi, '_');
    return clean.length ? clean.slice(0, 40) : 'child';
  };

  const exportPdfAndImage = handleSubmit(async (data: ChildFormData) => {
    setIsExporting(true);
    try {
      setCaptureData(data);
      await new Promise((resolve) => setTimeout(resolve, 30));

      if (!viewShotRef.current) throw new Error('Capture view is not ready');

      const shotUri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
      });
      const safeName = sanitizeForFileSystem(data.fullName);

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please allow photo library access to save the image.',
        );
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(shotUri);
      const albumName = `ChildGuardID - ${safeName}`;
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert('Saved', `Image saved to Photos album: ${albumName}`);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Could not export the image.');
    } finally {
      setIsExporting(false);
    }
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <AppText style={styles.backButtonText}>←</AppText>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <AppText variant="heading" style={styles.headerTitle}>
                {isEditMode ? 'Edit Profile' : 'Create Profile'}
              </AppText>
              <AppText variant="subtitle" style={styles.headerSubtext}>
                {isEditMode
                  ? 'Update child information'
                  : 'Add a new child profile'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Full Name */}
        <FormField
          control={control}
          name="fullName"
          label="Full Name"
          placeholder="Enter full name"
          error={errors.fullName?.message}
        />

        {/* Age & Gender Row */}
        <View style={styles.row}>
          <FormField
            control={control}
            name="age"
            label="Age"
            placeholder="Age in years"
            keyboardType="numeric"
            error={errors.age?.message}
            containerStyle={{ flex: 1, marginRight: 10 }}
          />
          <FormField
            control={control}
            name="gender"
            label="Gender (Optional)"
            placeholder="Optional"
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Height & Weight Row */}
        <View style={styles.row}>
          <FormField
            control={control}
            name="height"
            label="Height (cm)"
            placeholder="Height in cm"
            keyboardType="numeric"
            error={errors.height?.message}
            containerStyle={{ flex: 1, marginRight: 10 }}
          />
          <FormField
            control={control}
            name="weight"
            label="Weight (kg)"
            placeholder="Weight in kg"
            keyboardType="numeric"
            error={errors.weight?.message}
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Medical Notes */}
        <FormField
          control={control}
          name="medicalNotes"
          label="Medical Notes"
          placeholder="Enter any medical notes, allergies, or conditions (optional)"
          multiline
          numberOfLines={4}
          error={errors.medicalNotes?.message}
        />

        {/* Section: Identifying Features */}
        <AppText variant="heading" style={{ marginTop: 20, marginBottom: 16, fontSize: 20 }}>
          Identifying Features
        </AppText>

        {/* Birthmarks */}
        <Controller
          control={control}
          name="hasBirthmarks"
          render={({ field: { onChange, value } }) => (
            <AppDropdown
              label="Does your child have any birthmarks?"
              options={[
                { label: 'No', value: 'no' },
                { label: 'Yes', value: 'yes' },
              ]}
              value={value}
              onValueChange={onChange}
              placeholder="Select"
            />
          )}
        />
        {hasBirthmarks === 'yes' && (
          <FormField
            control={control}
            name="birthmarksDescription"
            label="Describe birthmarks"
            placeholder="Enter description of birthmarks"
            multiline
            numberOfLines={3}
            error={errors.birthmarksDescription?.message}
          />
        )}

        {/* Scars */}
        <Controller
          control={control}
          name="hasScars"
          render={({ field: { onChange, value } }) => (
            <AppDropdown
              label="Does your child have any scars?"
              options={[
                { label: 'No', value: 'no' },
                { label: 'Yes', value: 'yes' },
              ]}
              value={value}
              onValueChange={onChange}
              placeholder="Select"
            />
          )}
        />
        {hasScars === 'yes' && (
          <FormField
            control={control}
            name="scarsDescription"
            label="Describe scars"
            placeholder="Enter description of scars"
            multiline
            numberOfLines={3}
            error={errors.scarsDescription?.message}
          />
        )}

        {/* Other Identifying Features */}
        <Controller
          control={control}
          name="hasIdentifyingFeatures"
          render={({ field: { onChange, value } }) => (
            <AppDropdown
              label="Does your child have any other key identifying features?"
              options={[
                { label: 'No', value: 'no' },
                { label: 'Yes', value: 'yes' },
              ]}
              value={value}
              onValueChange={onChange}
              placeholder="Select"
            />
          )}
        />
        {hasIdentifyingFeatures === 'yes' && (
          <FormField
            control={control}
            name="identifyingFeaturesDescription"
            label="Describe identifying features"
            placeholder="Enter description of identifying features"
            multiline
            numberOfLines={3}
            error={errors.identifyingFeaturesDescription?.message}
          />
        )}

        {/* Last Known Location */}
        <FormField
          control={control}
          name="lastKnownLocation"
          label="Last Known Location (Optional)"
          placeholder="Enter last known location"
          error={errors.lastKnownLocation?.message}
        />

        {/* School/Daycare */}
        <Controller
          control={control}
          name="schoolDaycareType"
          render={({ field: { onChange, value } }) => (
            <AppDropdown
              label="Is your child in school or daycare?"
              options={[
                { label: 'None', value: 'none' },
                { label: 'School', value: 'school' },
                { label: 'Daycare', value: 'daycare' },
              ]}
              value={value}
              onValueChange={onChange}
              placeholder="Select"
            />
          )}
        />
        {(schoolDaycareType === 'school' || schoolDaycareType === 'daycare') && (
          <FormField
            control={control}
            name="schoolDaycareName"
            label={schoolDaycareType === 'school' ? 'School Name' : 'Daycare Name'}
            placeholder={`Enter ${schoolDaycareType} name`}
            error={errors.schoolDaycareName?.message}
          />
        )}

        {/* Sports Teams */}
        <FormField
          control={control}
          name="sportsTeams"
          label="Sports Teams (Optional)"
          placeholder="Enter sports teams if applicable"
          error={errors.sportsTeams?.message}
        />

        {/* Section: Parents Information */}
        <AppText variant="heading" style={{ marginTop: 20, marginBottom: 16, fontSize: 20 }}>
          Parents Information
        </AppText>

        {/* Parent 1 */}
        <FormField
          control={control}
          name="parent1Name"
          label="Parent 1 - Full Name (Optional)"
          placeholder="Enter full name"
          error={errors.parent1Name?.message}
        />
        <FormField
          control={control}
          name="parent1Address"
          label="Parent 1 - Address (Optional)"
          placeholder="Enter address"
          error={errors.parent1Address?.message}
        />
        <FormField
          control={control}
          name="parent1Phone"
          label="Parent 1 - Phone Number (Optional)"
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.parent1Phone?.message}
        />

        {/* Parent 2 */}
        <FormField
          control={control}
          name="parent2Name"
          label="Parent 2 - Full Name (Optional)"
          placeholder="Enter full name"
          error={errors.parent2Name?.message}
        />
        <FormField
          control={control}
          name="parent2Address"
          label="Parent 2 - Address (Optional)"
          placeholder="Enter address"
          error={errors.parent2Address?.message}
        />
        <FormField
          control={control}
          name="parent2Phone"
          label="Parent 2 - Phone Number (Optional)"
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.parent2Phone?.message}
        />

        {/* Section: Emergency Contacts */}
        <AppText variant="heading" style={{ marginTop: 20, marginBottom: 16, fontSize: 20 }}>
          Emergency Contacts (Minimum 1, Maximum 3)
        </AppText>

        {fields.map((field, index) => (
          <View key={field.id} style={{ marginBottom: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
            {fields.length > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <AppText variant="fieldLabel">Contact {index + 1}</AppText>
                <TouchableOpacity
                  onPress={() => remove(index)}
                  style={{ padding: 8 }}
                >
                  <AppText style={{ color: '#dc3545', fontWeight: '600' }}>Remove</AppText>
                </TouchableOpacity>
              </View>
            )}
            <FormField
              control={control}
              name={`emergencyContacts.${index}.name` as any}
              label="Name"
              placeholder="Enter name"
              error={errors.emergencyContacts?.[index]?.name?.message}
            />
            <FormField
              control={control}
              name={`emergencyContacts.${index}.relationship` as any}
              label="Relationship"
              placeholder="e.g., Grandparent, Aunt, Family Friend"
              error={errors.emergencyContacts?.[index]?.relationship?.message}
            />
            <FormField
              control={control}
              name={`emergencyContacts.${index}.sex` as any}
              label="Sex (Optional)"
              placeholder="Enter sex"
              error={errors.emergencyContacts?.[index]?.sex?.message}
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
              label="Address (Optional)"
              placeholder="Enter address"
              error={errors.emergencyContacts?.[index]?.address?.message}
            />
          </View>
        ))}

        {fields.length < 3 && (
          <TouchableOpacity
            onPress={() => append({ name: '', relationship: '', sex: '', phone: '', address: '' })}
            style={[sharedStyles.secondaryButton, { marginBottom: 20 }]}
          >
            <AppText variant="label" style={sharedStyles.secondaryButtonText}>
              + Add Emergency Contact
            </AppText>
          </TouchableOpacity>
        )}

        {errors.emergencyContacts && (
          <AppText variant="error" style={{ marginBottom: 16 }}>
            {errors.emergencyContacts.message || 'At least one emergency contact is required'}
          </AppText>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={sharedStyles.primaryButton}
          onPress={handleSubmit(onSubmit)}
        >
          <AppText variant="label" style={sharedStyles.primaryButtonText}>
            {isEditMode ? 'Update Profile' : 'Save Child Profile'}
          </AppText>
        </TouchableOpacity>

        {/* Export Button */}
        <TouchableOpacity
          style={[
            sharedStyles.secondaryButton,
            styles.exportButton,
            isExporting && styles.disabledButton,
          ]}
          onPress={exportPdfAndImage}
          disabled={isExporting}
        >
          <AppText variant="label" style={sharedStyles.secondaryButtonText}>
            {isExporting ? 'Working...' : 'Export Image'}
          </AppText>
        </TouchableOpacity>

        {/* Delete Button (edit mode only) */}
        {isEditMode && (
          <TouchableOpacity
            style={sharedStyles.dangerButton}
            onPress={handleDelete}
          >
            <AppText variant="label" style={sharedStyles.dangerButtonText}>
              Delete Profile
            </AppText>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Hidden offscreen card for image capture */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1 }}
        style={styles.hiddenCapture}
      >
        <View style={styles.captureCard}>
          <AppText variant="heading" style={styles.captureTitle}>
            Child Guard ID
          </AppText>
          <AppText variant="label" style={styles.captureName}>
            {(captureData?.fullName || '').trim() || 'Name missing'}
          </AppText>
          <View style={styles.captureRow}>
            <AppText style={styles.captureLabel}>Age</AppText>
            <AppText style={styles.captureValue}>
              {captureData?.age ?? ''}
            </AppText>
          </View>
          <View style={styles.captureRow}>
            <AppText style={styles.captureLabel}>Gender</AppText>
            <AppText style={styles.captureValue}>
              {captureData?.gender || '—'}
            </AppText>
          </View>
          <View style={styles.captureRow}>
            <AppText style={styles.captureLabel}>Height (cm)</AppText>
            <AppText style={styles.captureValue}>
              {captureData?.height ?? ''}
            </AppText>
          </View>
          <View style={styles.captureRow}>
            <AppText style={styles.captureLabel}>Weight (kg)</AppText>
            <AppText style={styles.captureValue}>
              {captureData?.weight ?? ''}
            </AppText>
          </View>
          {captureData?.lastKnownLocation && (
            <View style={styles.captureRow}>
              <AppText style={styles.captureLabel}>Last Known Location</AppText>
              <AppText style={styles.captureValue}>
                {captureData.lastKnownLocation}
              </AppText>
            </View>
          )}
          {captureData?.schoolDaycareType && captureData.schoolDaycareType !== 'none' && (
            <View style={styles.captureRow}>
              <AppText style={styles.captureLabel}>
                {captureData.schoolDaycareType === 'school' ? 'School' : 'Daycare'}
              </AppText>
              <AppText style={styles.captureValue}>
                {captureData.schoolDaycareName || '—'}
              </AppText>
            </View>
          )}
          {(captureData?.hasBirthmarks === 'yes' || captureData?.hasScars === 'yes' || captureData?.hasIdentifyingFeatures === 'yes') && (
            <>
              <AppText style={styles.captureSection}>Identifying Features</AppText>
              {captureData.hasBirthmarks === 'yes' && captureData.birthmarksDescription && (
                <AppText style={styles.captureNotes}>
                  <AppText style={styles.captureLabel}>Birthmarks: </AppText>
                  {captureData.birthmarksDescription}
                </AppText>
              )}
              {captureData.hasScars === 'yes' && captureData.scarsDescription && (
                <AppText style={styles.captureNotes}>
                  <AppText style={styles.captureLabel}>Scars: </AppText>
                  {captureData.scarsDescription}
                </AppText>
              )}
              {captureData.hasIdentifyingFeatures === 'yes' && captureData.identifyingFeaturesDescription && (
                <AppText style={styles.captureNotes}>
                  <AppText style={styles.captureLabel}>Other Features: </AppText>
                  {captureData.identifyingFeaturesDescription}
                </AppText>
              )}
            </>
          )}
          <AppText style={styles.captureSection}>Medical Notes</AppText>
          <AppText style={styles.captureNotes}>
            {captureData?.medicalNotes || 'None provided'}
          </AppText>
          {captureData?.emergencyContacts && captureData.emergencyContacts.length > 0 && (
            <>
              <AppText style={styles.captureSection}>Emergency Contacts</AppText>
              {captureData.emergencyContacts.map((contact: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <AppText style={styles.captureNotes}>
                    <AppText style={styles.captureLabel}>{contact.name || '—'}</AppText>
                    {contact.relationship && ` (${contact.relationship})`}
                    {contact.phone && ` - ${contact.phone}`}
                  </AppText>
                </View>
              ))}
            </>
          )}
        </View>
      </ViewShot>
    </KeyboardAvoidingView>
  );
}
