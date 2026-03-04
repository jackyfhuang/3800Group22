import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

import { addChildStyles as styles, sharedStyles } from '@/styles';
import { AppText } from '@/components/ui/app-text';
import { AppTextInput } from '@/components/ui/app-text-input';
import { FormField } from '@/components/ui/form-field';

// ─── Validation Schema ────────────────────────────────────────────────────────
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
  } = useForm({
    resolver: zodResolver(childSchema),
    defaultValues: {
      fullName: '',
      gender: '',
      medicalNotes: '',
      age: undefined,
      height: undefined,
      weight: undefined,
    },
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
          <AppText style={styles.captureSection}>Medical Notes</AppText>
          <AppText style={styles.captureNotes}>
            {captureData?.medicalNotes || 'None provided'}
          </AppText>
        </View>
      </ViewShot>
    </KeyboardAvoidingView>
  );
}
