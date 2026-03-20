import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { z } from 'zod';

import { AppDropdown } from '@/components/ui/app-dropdown';
import { AppText } from '@/components/ui/app-text';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { StepProgressBar } from '@/components/ui/step-progress-bar';
import { colors, sharedStyles, addChildStyles as styles } from '@/styles';

// ─── Validation Schema ────────────────────────────────────────────────────────

const guardianSchema = z.object({
  name:    z.string().min(2, 'Name is required'),
  phone:   z.string().min(7, 'Valid phone number is required'),
  address: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name:         z.string().min(2, 'Name is required'),
  relationship: z.string().min(2, 'Relationship is required'),
  phone:        z.string().min(7, 'Valid phone number is required'),
  address:      z.string().optional(),
});

const childSchema = z.object({
  // ── Step 1: Essential ID ──────────────────────────────────────────────────
  firstName:   z.string().min(2, 'First name must be at least 2 characters'),
  lastName:    z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  age:         z.string().optional(), // auto-calculated, read-only
  sex:         z.string().min(1, 'Sex is required'),
  ethnicity:   z.string().min(1, 'Ethnicity is required'),
  height:      z.coerce.number().min(30, 'Height (cm) seems too low').max(250, 'Height seems too high'),
  weight:      z.coerce.number().min(2, 'Weight (kg) seems too low'),

  // ── Step 2: Medical ───────────────────────────────────────────────────────
  lifeThreatAllergies:   z.string().optional(),
  emergencyMedications:  z.string().optional(),
  communicationNeeds:    z.string().optional(),
  languageSpoken:        z.string().optional(),
  otherMedicalNotes:     z.string().optional(),

  // ── Step 3: Contacts ──────────────────────────────────────────────────────
  guardian1:          guardianSchema,
  guardian2:          guardianSchema,
  emergencyContacts:  z.array(emergencyContactSchema).min(2, 'At least 2 emergency contacts are required'),

  // ── Step 4: Visual Identifiers ────────────────────────────────────────────
  eyeColor:          z.string().optional(),
  hairColor:         z.string().optional(),
  hairStyle:         z.string().optional(),
  hasHat:            z.boolean().optional(),
  hatColor:          z.string().optional(),
  hatStyle:          z.string().optional(),
  topColor:          z.string().optional(),
  pantsColor:        z.string().optional(),
  shoesColor:        z.string().optional(),
  shoesType:         z.string().optional(),
  hasGlasses:        z.boolean().optional(),
  hasHearingAids:    z.boolean().optional(),
  otherSensoryNeeds: z.string().optional(),
});

type ChildFormData = z.infer<typeof childSchema>;

// ─── Step field keys for per-step validation ─────────────────────────────────
const STEP_FIELDS: Record<number, (keyof ChildFormData)[]> = {
  1: ['firstName', 'lastName', 'dateOfBirth', 'sex', 'ethnicity', 'height', 'weight'],
  2: [],
  3: ['guardian1', 'guardian2', 'emergencyContacts'],
  4: [],
};

// ─── Dropdown Options ─────────────────────────────────────────────────────────
const SEX_OPTIONS = [
  { label: 'Male',   value: 'male' },
  { label: 'Female', value: 'female' },
];

const ETHNICITY_OPTIONS = [
  { label: 'Asian',                            value: 'asian' },
  { label: 'Black or African American',        value: 'black' },
  { label: 'Hispanic or Latino',               value: 'hispanic' },
  { label: 'Middle Eastern or North African',  value: 'mena' },
  { label: 'Native American or Alaska Native', value: 'native_american' },
  { label: 'Pacific Islander',                 value: 'pacific_islander' },
  { label: 'White or Caucasian',               value: 'white' },
  { label: 'Mixed / Multiracial',              value: 'mixed' },
  { label: 'Prefer not to say',                value: 'prefer_not' },
  { label: 'Other',                            value: 'other' },
];

const COMMUNICATION_OPTIONS = [
  { label: 'Verbal',           value: 'verbal' },
  { label: 'Non-verbal',       value: 'non_verbal' },
  { label: 'Language Barrier', value: 'language_barrier' },
];

const EYE_COLOR_OPTIONS = [
  { label: 'Brown',  value: 'brown' },
  { label: 'Blue',   value: 'blue' },
  { label: 'Green',  value: 'green' },
  { label: 'Hazel',  value: 'hazel' },
  { label: 'Grey',   value: 'grey' },
  { label: 'Amber',  value: 'amber' },
  { label: 'Other',  value: 'other' },
];

const HAIR_COLOR_OPTIONS = [
  { label: 'Black',      value: 'black' },
  { label: 'Dark Brown', value: 'dark_brown' },
  { label: 'Brown',      value: 'brown' },
  { label: 'Light Brown',value: 'light_brown' },
  { label: 'Blonde',     value: 'blonde' },
  { label: 'Red',        value: 'red' },
  { label: 'Grey',       value: 'grey' },
  { label: 'White',      value: 'white' },
  { label: 'Dyed/Other', value: 'other' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    trigger,
    setValue,
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      firstName: '', lastName: '', dateOfBirth: '', age: '',
      sex: '', ethnicity: '', height: undefined, weight: undefined,
      lifeThreatAllergies: '', emergencyMedications: '',
      communicationNeeds: '', languageSpoken: '', otherMedicalNotes: '',
      guardian1: { name: '', phone: '', address: '' },
      guardian2: { name: '', phone: '', address: '' },
      emergencyContacts: [
        { name: '', relationship: '', phone: '', address: '' },
        { name: '', relationship: '', phone: '', address: '' },
      ],
      eyeColor: '', hairColor: '', hairStyle: '',
      hasHat: false, hatColor: '', hatStyle: '',
      topColor: '', pantsColor: '', shoesColor: '', shoesType: '',
      hasGlasses: false, hasHearingAids: false, otherSensoryNeeds: '',
    },
  });

  // Watch conditional fields
  const communicationNeeds = watch('communicationNeeds');
  const hasHat            = watch('hasHat');
  const hasGlasses        = watch('hasGlasses');
  const hasHearingAids    = watch('hasHearingAids');
  const dateOfBirth       = watch('dateOfBirth');

  // Auto-calculate age from DOB
  useEffect(() => {
    if (dateOfBirth && dateOfBirth.length === 10) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age >= 0 && age <= 18) setValue('age', age.toString());
    }
  }, [dateOfBirth]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyContacts',
  });

  const viewShotRef = React.createRef<ViewShot>();
  const [captureData, setCaptureData] = useState<ChildFormData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) loadChildForEdit(id);
  }, [id, isEditMode]);

  // ─── Data Handlers ────────────────────────────────────────────────────────
  const loadChildForEdit = async (childId: string) => {
    try {
      const childrenJson = await AsyncStorage.getItem('children_list');
      if (childrenJson) {
        const list = JSON.parse(childrenJson);
        const child = list.find((c: any) => c.id === childId);
        if (child) reset(child, { keepDefaultValues: false });
      }
    } catch (error) {
      console.error('Error loading child for edit:', error);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (!isDirty) return router.back();
    if (Platform.OS === 'web') {
      const confirmed = window.confirm?.('Unsaved changes will be lost. Go back?') ?? true;
      if (confirmed) router.back();
    } else {
      Alert.alert('Unsaved Changes', 'Your changes will not be saved.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    const valid = fieldsToValidate.length === 0
      ? true
      : await trigger(fieldsToValidate as any);

    if (!valid) return;

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
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
    // Going forward — validate all steps up to target
    for (let s = currentStep; s < step; s++) {
      const fields = STEP_FIELDS[s];
      if (fields.length > 0) {
        const valid = await trigger(fields as any);
        if (!valid) return;
        if (!completedSteps.includes(s)) {
          setCompletedSteps(prev => [...prev, s]);
        }
      }
    }
    setCurrentStep(step);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;
    Alert.alert(
      'Delete Child Profile',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const json = await AsyncStorage.getItem('children_list');
              if (json) {
                const list = JSON.parse(json).filter((c: any) => c.id !== id);
                await AsyncStorage.setItem('children_list', JSON.stringify(list));
                Alert.alert('Success', 'Child profile deleted');
                router.back();
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to delete child profile');
            }
          },
        },
      ]
    );
  };

  const onSubmit = async (data: ChildFormData) => {
    try {
      const json = await AsyncStorage.getItem('children_list');
      let list = json ? JSON.parse(json) : [];
      if (isEditMode && id) {
        const idx = list.findIndex((c: any) => c.id === id);
        if (idx !== -1) {
          list[idx] = { ...data, id };
          Alert.alert('Success', 'Child profile updated!');
        } else {
          Alert.alert('Error', 'Child profile not found');
          return;
        }
      } else {
        list.push({ ...data, id: Date.now().toString() });
        Alert.alert('Success', 'Child profile saved!');
      }
      await AsyncStorage.setItem('children_list', JSON.stringify(list));
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const sanitizeForFileSystem = (value: string) => {
    const clean = value.trim().replace(/[^a-z0-9-_]+/gi, '_');
    return clean.length ? clean.slice(0, 40) : 'child';
  };

  const exportImage = handleSubmit(async (data: ChildFormData) => {
    setIsExporting(true);
    try {
      setCaptureData(data);
      await new Promise(r => setTimeout(r, 30));
      if (!viewShotRef.current) throw new Error('Capture view not ready');
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 1 });
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo library access.');
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(uri);
      const albumName = `ChildGuardID - ${sanitizeForFileSystem(data.firstName)}`;
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      else await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      Alert.alert('Saved', `Image saved to Photos: ${albumName}`);
    } catch (e) {
      Alert.alert('Error', 'Could not export image.');
    } finally {
      setIsExporting(false);
    }
  });

  // ─── Step Titles ──────────────────────────────────────────────────────────
  const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: 'Essential ID',    subtitle: 'Basic identification information' },
    2: { title: 'Medical',         subtitle: 'Health and communication needs' },
    3: { title: 'Contacts',        subtitle: 'Guardians and emergency contacts' },
    4: { title: 'Visual ID',       subtitle: 'Appearance and identifiers' },
  };

  // ─── Render Steps ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <FormSection title="Identity" subtitle="All fields required">
        <View style={styles.row}>
          <FormField control={control} name="firstName" label="First Name"
            placeholder="First name" error={errors.firstName?.message}
            containerStyle={{ flex: 1 }} />
          <FormField control={control} name="lastName" label="Last Name"
            placeholder="Last name" error={errors.lastName?.message}
            containerStyle={{ flex: 1 }} />
        </View>

        <FormField control={control} name="dateOfBirth" label="Date of Birth (YYYY-MM-DD)"
          placeholder="e.g. 2018-04-15" error={errors.dateOfBirth?.message} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText variant="fieldLabel">Age (auto-calculated)</AppText>
            <View style={styles.readOnlyField}>
              <AppText style={styles.readOnlyText}>
                {watch('age') ? `${watch('age')} years` : 'Enter DOB above'}
              </AppText>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <AppDropdown cont rgsroc3rkckfkrol={control} name="sex" label="Sex"
              options={SEX_OPTIONS} placeholder="Select"
              error={errors.sex?essage} fvbbl/672->
          </View>c
        </View>

        <AppDropdown control={control} name="ethnicity" label="Ethnicity"
          options={ETHNICITY_OPTIONS} placeholder="Select ethnicity"
          error={errors.ethnicity?.message} />
      </FormSection>

      <FormSection title="Physical" subtitle="All fields required">
        <View style={styles.row}>
          <FormField control={control} name="height" label="Height (cm)"
            placeholder="e.g. 120" keyboardType="numeric"
            error={errors.height?.message} containerStyle={{ flex: 1 }} />
          <FormField control={control} name="weight" label="Weight (kg)"
            placeholder="e.g. 25" keyboardType="numeric"
            error={errors.weight?.message} containerStyle={{ flex: 1 }} />
        </View>
      </FormSection>
    </>
  );

  const renderStep2 = () => (
    <FormSection title="Medical Info" subtitle="All fields optional">
      <FormField control={control} name="lifeThreatAllergies"
        label="Life-Threatening Allergies"
        placeholder="e.g. Peanuts, Bee stings — leave blank if none"
        multiline numberOfLines={3} />

      <FormField control={control} name="emergencyMedications"
        label="Emergency Medications"
        placeholder="e.g. EpiPen, Inhaler — leave blank if none"
        multiline numberOfLines={3} />

      <AppDropdown control={control} name="communicationNeeds"
        label="Communication Needs"
        options={COMMUNICATION_OPTIONS} placeholder="Select" />

      {communicationNeeds === 'language_barrier' && (
        <FormField control={control} name="languageSpoken"
          label="Language They Speak"
          placeholder="e.g. Spanish, Mandarin, French"
          error={errors.languageSpoken?.message} />
      )}

      <FormField control={control} name="otherMedicalNotes"
        label="Other Medical Notes"
        placeholder="Any other relevant medical information"
        multiline numberOfLines={4} />
    </FormSection>
  );

  const renderStep3 = () => (
    <>
      <FormSection title="Primary Guardian 1" subtitle="Name and phone required">
        <FormField control={control} name="guardian1.name" label="Full Name"
          placeholder="Enter full name" error={errors.guardian1?.name?.message} />
        <FormField control={control} name="guardian1.phone" label="Phone Number"
          placeholder="Enter phone number" keyboardType="phone-pad"
          error={errors.guardian1?.phone?.message} />
        <FormField control={control} name="guardian1.address"
          label="Address (Recommended)" placeholder="Enter address" />
      </FormSection>

      <FormSection title="Primary Guardian 2" subtitle="Name and phone required">
        <FormField control={control} name="guardian2.name" label="Full Name"
          placeholder="Enter full name" error={errors.guardian2?.name?.message} />
        <FormField control={control} name="guardian2.phone" label="Phone Number"
          placeholder="Enter phone number" keyboardType="phone-pad"
          error={errors.guardian2?.phone?.message} />
        <FormField control={control} name="guardian2.address"
          label="Address (Recommended)" placeholder="Enter address" />
      </FormSection>

      <FormSection title="Emergency Contacts"
        subtitle="Minimum 2 required — must not be a parent or guardian">
        {fields.map((field, index) => (
          <View key={field.id} style={styles.contactCard}>
            <View style={styles.contactCardHeader}>
              <AppText style={styles.contactCardTitle}>Contact {index + 1}</AppText>
              {fields.length > 2 && (
                <TouchableOpacity onPress={() => remove(index)}>
                  <AppText style={styles.removeContactText}>Remove</AppText>
                </TouchableOpacity>
              )}
            </View>
            <FormField control={control}
              name={`emergencyContacts.${index}.name` as any}
              label="Full Name" placeholder="Enter name"
              error={errors.emergencyContacts?.[index]?.name?.message} />
            <FormField control={control}
              name={`emergencyContacts.${index}.relationship` as any}
              label="Relationship" placeholder="e.g. Aunt, Family Friend, Neighbour"
              error={errors.emergencyContacts?.[index]?.relationship?.message} />
            <FormField control={control}
              name={`emergencyContacts.${index}.phone` as any}
              label="Phone Number" placeholder="Enter phone number"
              keyboardType="phone-pad"
              error={errors.emergencyContacts?.[index]?.phone?.message} />
            <FormField control={control}
              name={`emergencyContacts.${index}.address` as any}
              label="Address (Recommended)" placeholder="Enter address" />
          </View>
        ))}

        {fields.length < 4 && (
          <TouchableOpacity
            onPress={() => append({ name: '', relationship: '', phone: '', address: '' })}
            style={sharedStyles.secondaryButton}>
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
      <FormSection title="Hair & Eyes" subtitle="All optional">
        <View style={styles.row}>
          <AppDropdown control={control} name="eyeColor" label="Eye Color"
            options={EYE_COLOR_OPTIONS} placeholder="Select"
            containerStyle={{ flex: 1 }} />
          <AppDropdown control={control} name="hairColor" label="Hair Color"
            options={HAIR_COLOR_OPTIONS} placeholder="Select"
            containerStyle={{ flex: 1 }} />
        </View>
        <FormField control={control} name="hairStyle" label="Hair Style"
          placeholder="e.g. Short, Curly, Braids, Ponytail" />
      </FormSection>

      <FormSection title="Clothing" subtitle="All optional — describe what they were last wearing">
        <View style={styles.toggleRow}>
          <AppText style={styles.toggleLabel}>Wearing a hat?</AppText>
          <Switch
            value={hasHat ?? false}
            onValueChange={v => setValue('hasHat', v)}
            trackColor={{ false: colors.cardBorder, true: colors.secondary }}
            thumbColor={hasHat ? colors.white : colors.white}
          />
        </View>
        {hasHat && (
          <View style={styles.row}>
            <FormField control={control} name="hatColor" label="Hat Color"
              placeholder="e.g. Red" containerStyle={{ flex: 1 }} />
            <FormField control={control} name="hatStyle" label="Hat Style"
              placeholder="e.g. Baseball cap" containerStyle={{ flex: 1 }} />
          </View>
        )}

        <FormField control={control} name="topColor" label="Top / Shirt Color"
          placeholder="e.g. Blue hoodie, white t-shirt" />
        <FormField control={control} name="pantsColor" label="Pants / Bottom Color"
          placeholder="e.g. Dark jeans, grey leggings" />

        <View style={styles.row}>
          <FormField control={control} name="shoesColor" label="Shoes Color"
            placeholder="e.g. White" containerStyle={{ flex: 1 }} />
          <FormField control={control} name="shoesType" label="Shoes Type"
            placeholder="e.g. Sneakers" containerStyle={{ flex: 1 }} />
        </View>
      </FormSection>

      <FormSection title="Sensory Needs" subtitle="All optional">
        <View style={styles.toggleRow}>
          <AppText style={styles.toggleLabel}>Wears glasses?</AppText>
          <Switch
            value={hasGlasses ?? false}
            onValueChange={v => setValue('hasGlasses', v)}
            trackColor={{ false: colors.cardBorder, true: colors.secondary }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.toggleRow}>
          <AppText style={styles.toggleLabel}>Wears hearing aids?</AppText>
          <Switch
            value={hasHearingAids ?? false}
            onValueChange={v => setValue('hasHearingAids', v)}
            trackColor={{ false: colors.cardBorder, true: colors.secondary }}
            thumbColor={colors.white}
          />
        </View>
        <FormField control={control} name="otherSensoryNeeds"
          label="Other Sensory Needs"
          placeholder="e.g. Wheelchair, walking aid, sensory bracelet"
          multiline numberOfLines={3} />
      </FormSection>
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <AppText style={styles.backButtonText}>←</AppText>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <AppText variant="heading" style={styles.headerTitle}>
                {isEditMode ? 'Edit Profile' : stepTitles[currentStep].title}
              </AppText>
              <AppText variant="subtitle" style={styles.headerSubtext}>
                {isEditMode ? 'Update child information' : stepTitles[currentStep].subtitle}
              </AppText>
            </View>
          </View>
        </View>

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <View style={styles.navButtonRow}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.navButtonBack} onPress={handleBack}>
              <AppText style={styles.navButtonBackText}>← Back</AppText>
            </TouchableOpacity>
          )}
          {currentStep < 4 ? (
            <TouchableOpacity style={styles.navButtonNext} onPress={handleNext}>
              <AppText style={styles.navButtonNextText}>Next →</AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButtonNext, { backgroundColor: colors.primary }]}
              onPress={handleSubmit(onSubmit)}>
              <AppText style={styles.navButtonNextText}>
                {isEditMode ? 'Update Profile' : 'Save Profile'}
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Export + Delete (step 4 or edit mode) */}
        {(currentStep === 4 || isEditMode) && (
          <>
            <TouchableOpacity
              style={[sharedStyles.secondaryButton, styles.exportButton, isExporting && styles.disabledButton]}
              onPress={exportImage} disabled={isExporting}>
              <AppText variant="label" style={sharedStyles.secondaryButtonText}>
                {isExporting ? 'Working...' : 'Export Image'}
              </AppText>
            </TouchableOpacity>
            {isEditMode && (
              <TouchableOpacity style={sharedStyles.dangerButton} onPress={handleDelete}>
                <AppText variant="label" style={sharedStyles.dangerButtonText}>
                  Delete Profile
                </AppText>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Step Progress Bar */}
      <StepProgressBar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepPress={handleStepPress}
      />

      {/* Hidden export card */}
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={styles.hiddenCapture}>
        <View style={styles.captureCard}>
          <AppText variant="heading" style={styles.captureTitle}>Child Guard ID</AppText>
          <AppText variant="label" style={styles.captureName}>
            {`${captureData?.firstName || ''} ${captureData?.lastName || ''}`.trim() || 'Name missing'}
          </AppText>
          {[
            ['Date of Birth', captureData?.dateOfBirth],
            ['Age',           captureData?.age],
            ['Sex',           captureData?.sex],
            ['Ethnicity',     captureData?.ethnicity],
            ['Height (cm)',   captureData?.height],
            ['Weight (kg)',   captureData?.weight],
          ].map(([label, value]) => value ? (
            <View key={label as string} style={styles.captureRow}>
              <AppText style={styles.captureLabel}>{label}</AppText>
              <AppText style={styles.captureValue}>{value as string}</AppText>
            </View>
          ) : null)}
          {captureData?.lifeThreatAllergies && (
            <>
              <AppText style={styles.captureSection}>Medical</AppText>
              <AppText style={styles.captureNotes}>{captureData.lifeThreatAllergies}</AppText>
            </>
          )}
          {captureData?.guardian1?.name && (
            <>
              <AppText style={styles.captureSection}>Guardian 1</AppText>
              <AppText style={styles.captureNotes}>
                {captureData.guardian1.name} — {captureData.guardian1.phone}
              </AppText>
            </>
          )}
          {captureData?.emergencyContacts?.map((c, i) => (
            <View key={i}>
              <AppText style={styles.captureSection}>Emergency Contact {i + 1}</AppText>
              <AppText style={styles.captureNotes}>
                {c.name} ({c.relationship}) — {c.phone}
              </AppText>
            </View>
          ))}
        </View>
      </ViewShot>
    </KeyboardAvoidingView>
  );
}