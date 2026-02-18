import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

// Zod essentially can make input field rules really easy
// This is where logic is controlled
const childSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce
    .number()
    .min(0, "Age cannot be negative")
    .max(18, "Must be under 18"),
  height: z.coerce
    .number()
    .min(30, "Height (cm) seems too low")
    .max(250, "Height seems too high"),
  weight: z.coerce.number().min(2, "Weight (kg) seems too low"),
  gender: z.string().optional(),
  medicalNotes: z
    .string()
    .max(300, "Notes are too long (max 300 chars)")
    .optional(),
});


// Auto gen TypeScript types from the schema
type ChildFormData = z.infer<typeof childSchema>;

export default function AddChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  // Hook Logic, 
const { control, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
  resolver: zodResolver(childSchema),
  defaultValues: {
    fullName: '',
    gender: '',
    medicalNotes: '',
    age: undefined, 
    height: undefined,
    weight: undefined,
  }
});

  const viewShotRef = React.createRef<ViewShot>();
  const [captureData, setCaptureData] = React.useState<ChildFormData | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  // Load existing child data if editing
  useEffect(() => {
    if (isEditMode && id) {
      loadChildForEdit(id);
    }
  }, [id, isEditMode]);

  const loadChildForEdit = async (childId: string) => {
    try {
      const childrenJson = await AsyncStorage.getItem("children_list");
      if (childrenJson) {
        const childrenList = JSON.parse(childrenJson);
        const child = childrenList.find((c: any) => c.id === childId);
        if (child) {
          reset({
            fullName: child.fullName || "",
            age: child.age,
            height: child.height,
            weight: child.weight,
            gender: child.gender || '',
            medicalNotes: child.medicalNotes || '',
          }, { keepDefaultValues: false });
        }
      }
    } catch (error) {
      console.error("Error loading child for edit:", error);
    }
  };

  const handleBack = () => {
    // If form has been modified, show confirmation
    if (isDirty) {
      if (Platform.OS === 'web') {
        const confirmed = (typeof window !== 'undefined' && window.confirm)
          ? window.confirm('Are you sure you want to go back? Your changes will not be saved.')
          : true;
        if (confirmed) {
          router.back();
        }
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
          ]
        );
      }
    } else {
      // No changes, just go back
      router.back();
    }
  };

  const handleDelete = async () => {
    console.log('Delete button clicked, isEditMode:', isEditMode, 'id:', id);
    if (!isEditMode || !id) {
      console.log('Cannot delete: not in edit mode or no id');
      return;
    }

    Alert.alert(
      'Delete Child Profile',
      `Are you sure you want to delete this child profile? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('Delete cancelled') },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting child profile:', id);
              const childrenJson = await AsyncStorage.getItem('children_list');
              if (childrenJson) {
                const childrenList = JSON.parse(childrenJson);
                const updatedChildren = childrenList.filter((c: any) => c.id !== id);
                await AsyncStorage.setItem('children_list', JSON.stringify(updatedChildren));
                console.log('Child profile deleted successfully');
                Alert.alert('Success', 'Child profile deleted');
                router.back();
              } else {
                console.log('No children list found');
                Alert.alert('Error', 'No children found');
              }
            } catch (error) {
              console.error('Error deleting child:', error);
              Alert.alert('Error', 'Failed to delete child profile');
            }
          },
        },
      ]
    );
  };

  // SUBMIT HANDLER
  const onSubmit = async (data: ChildFormData) => {
    try {
      // Get existing children list
      const childrenJson = await AsyncStorage.getItem("children_list");
      let childrenList = childrenJson ? JSON.parse(childrenJson) : [];

      if (isEditMode && id) {
        // Update existing child
        const childIndex = childrenList.findIndex((c: any) => c.id === id);
        if (childIndex !== -1) {
          childrenList[childIndex] = {
            ...data,
            id: id, // Keep the same ID
          };
          Alert.alert("Success", "Child profile updated!");
        } else {
          Alert.alert("Error", "Child profile not found");
          return;
        }
      } else {
        // Add new child with unique ID
        const newChild = {
          ...data,
          id: Date.now().toString(), // Simple ID generation
        };
        childrenList.push(newChild);
        Alert.alert("Success", "Child profile saved!");
      }

      // Save updated list back to storage
      await AsyncStorage.setItem("children_list", JSON.stringify(childrenList));

      // Also migrate old single child format if it exists
      const oldChildJson = await AsyncStorage.getItem("child_profile");
      if (oldChildJson && !isEditMode) {
        // Only migrate if we're adding a new child (not editing)
        const oldChild = JSON.parse(oldChildJson);
        const migratedChild = { ...oldChild, id: (Date.now() + 1).toString() };
        const updatedList = [...childrenList, migratedChild];
        await AsyncStorage.setItem(
          "children_list",
          JSON.stringify(updatedList),
        );
        await AsyncStorage.removeItem("child_profile");
      }

      console.log("Saved to Disk:", childrenList);
      router.back();
    } catch (e) {
      console.error("Save error:", e);
      Alert.alert("Error", "Failed to save data");
    }
  };

  const sanitizeForFileSystem = (value: string) => {
    const fallback = "child";
    const clean = value.trim().replace(/[^a-z0-9-_]+/gi, "_");
    return clean.length ? clean.slice(0, 40) : fallback;
  };

  const exportPdfAndImage = handleSubmit(async (data: ChildFormData) => {
    setIsExporting(true);
    try {
      // fed data to the hidden capture card and render it before snapshot
      setCaptureData(data);
      // slight delay to ensure ViewShot updates before capture
      await new Promise((resolve) => setTimeout(resolve, 30));

      if (!viewShotRef.current) {
        throw new Error("Capture view is not ready");
      }
      // snapshot the offscreen card to PNG
      const shotUri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
      });
      const safeName = sanitizeForFileSystem(data.fullName);
      // ask Photos permission to save the image 
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access to save the image.",
        );
        return;
      }

      // save image to library and organize PDFs & images into per-child albums
      const asset = await MediaLibrary.createAssetAsync(shotUri);
      const albumName = `ChildGuardID - ${safeName}`;
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert("Saved", `Image saved to Photos album: ${albumName}`);
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Could not export the PDF and image.");
    } finally {
      setIsExporting(false);
    }
  });

  // Bellow AI generated form UI
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.header}>{isEditMode ? 'Edit Profile' : 'Create Profile'}</Text>
              <Text style={styles.headerSubtext}>
                {isEditMode ? 'Update child information' : 'Add a new child profile'}
              </Text>
            </View>
          </View>
        </View>

        {/* --- FORM FIELD: Full Name --- */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.fullName && styles.errorInput]}
                placeholder="Enter full name"
                placeholderTextColor="#999"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName.message}</Text>
          )}
        </View>

        {/* --- ROW: Age & Gender --- */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Age</Text>
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.age && styles.errorInput]}
                  placeholder="Age in years"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value?.toString()}
                />
              )}
            />
            {errors.age && (
              <Text style={styles.errorText}>{errors.age.message}</Text>
            )}
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Gender (Optional)</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor="#999"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        {/* --- ROW: Height & Weight --- */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Height (cm)</Text>
            <Controller
              control={control}
              name="height"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.height && styles.errorInput]}
                  placeholder="Height in cm"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value?.toString()}
                />
              )}
            />
            {errors.height && (
              <Text style={styles.errorText}>{errors.height.message}</Text>
            )}
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.weight && styles.errorInput]}
                  placeholder="Weight in kg"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value?.toString()}
                />
              )}
            />
            {errors.weight && (
              <Text style={styles.errorText}>{errors.weight.message}</Text>
            )}
          </View>
        </View>

        {/* --- FORM FIELD: Notes --- */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medical Notes</Text>
          <Controller
            control={control}
            name="medicalNotes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter any medical notes, allergies, or conditions (optional)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.medicalNotes && (
            <Text style={styles.errorText}>{errors.medicalNotes.message}</Text>
          )}
        </View>

        {/* --- SUBMIT BUTTON --- */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>
            {isEditMode ? "Update Profile" : "Save Child Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            isExporting && styles.disabledButton,
          ]}
          onPress={exportPdfAndImage}
          disabled={isExporting}
        >
          <Text style={styles.buttonText}>
            {isExporting ? "Working..." : "Export PDF & Image"}
          </Text>
        </TouchableOpacity>

        {/* --- DELETE BUTTON (only in edit mode) --- */}
        {isEditMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Profile</Text>
          </TouchableOpacity>
        )}

        {/* Spacer for bottom scrolling */}
        <View style={{ height: 40 }} />
      </ScrollView>
        {/* Hidden offscreen card for image capture */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        style={styles.hiddenCapture}
      >
        <View style={styles.captureCard}>
          <Text style={styles.captureTitle}>Child Guard ID</Text>
          <Text style={styles.captureName}>
            {(captureData?.fullName || "").trim() || "Name missing"}
          </Text>
          <View style={styles.captureRow}>
            <Text style={styles.captureLabel}>Age</Text>
            <Text style={styles.captureValue}>{captureData?.age ?? ""}</Text>
          </View>
          <View style={styles.captureRow}>
            <Text style={styles.captureLabel}>Gender</Text>
            <Text style={styles.captureValue}>
              {captureData?.gender || "—"}
            </Text>
          </View>
          <View style={styles.captureRow}>
            <Text style={styles.captureLabel}>Height (cm)</Text>
            <Text style={styles.captureValue}>{captureData?.height ?? ""}</Text>
          </View>
          <View style={styles.captureRow}>
            <Text style={styles.captureLabel}>Weight (kg)</Text>
            <Text style={styles.captureValue}>{captureData?.weight ?? ""}</Text>
          </View>
          <Text style={styles.captureSection}>Medical Notes</Text>
          <Text style={styles.captureNotes}>
            {captureData?.medicalNotes || "None provided"}
          </Text>
        </View>
      </ViewShot>
    </KeyboardAvoidingView>
  );
}

// AI gen CSS
const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 32,
    marginTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  headerSubtext: {
    fontSize: 16,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 52,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  errorInput: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  deleteButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#FF4444',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: "#111827",
  },
  disabledButton: {
    opacity: 0.6,
  },
  hiddenCapture: {
    position: "absolute",
    top: -2000,
    left: 0,
    width: 800,
    padding: 24,
    backgroundColor: "#f3f4f6",
  },
  captureCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  captureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  captureName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 16,
  },
  captureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  captureLabel: {
    fontWeight: "600",
    color: "#4b5563",
  },
  captureValue: {
    color: "#111827",
  },
  captureSection: {
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "700",
    color: "#111827",
  },
  captureNotes: {
    color: "#111827",
    lineHeight: 20,
  },
});
