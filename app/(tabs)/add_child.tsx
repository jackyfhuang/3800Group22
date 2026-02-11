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

// Zod essentially can make input field rules really easy 
// This is where logic is controlled 
const childSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(0, "Age cannot be negative").max(18, "Must be under 18"),
  height: z.coerce.number().min(30, "Height (cm) seems too low").max(250, "Height seems too high"),
  weight: z.coerce.number().min(2, "Weight (kg) seems too low"),
  gender: z.string().optional(),
  medicalNotes: z.string().max(300, "Notes are too long (max 300 chars)").optional(),
});

// Auto gen TypeScript types from the schema
type ChildFormData = z.infer<typeof childSchema>;

export default function AddChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  // Hook Logic, 
const { control, handleSubmit, formState: { errors }, reset } = useForm({
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

  // Load existing child data if editing
  useEffect(() => {
    if (isEditMode && id) {
      loadChildForEdit(id);
    }
  }, [id, isEditMode]);

  const loadChildForEdit = async (childId: string) => {
    try {
      const childrenJson = await AsyncStorage.getItem('children_list');
      if (childrenJson) {
        const childrenList = JSON.parse(childrenJson);
        const child = childrenList.find((c: any) => c.id === childId);
        if (child) {
          reset({
            fullName: child.fullName || '',
            age: child.age,
            height: child.height,
            weight: child.weight,
            gender: child.gender || '',
            medicalNotes: child.medicalNotes || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading child for edit:', error);
    }
  };

  // SUBMIT HANDLER
const onSubmit = async (data: ChildFormData) => {
  try {
    // Get existing children list
    const childrenJson = await AsyncStorage.getItem('children_list');
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
    await AsyncStorage.setItem('children_list', JSON.stringify(childrenList));

    // Also migrate old single child format if it exists
    const oldChildJson = await AsyncStorage.getItem('child_profile');
    if (oldChildJson && !isEditMode) {
      // Only migrate if we're adding a new child (not editing)
      const oldChild = JSON.parse(oldChildJson);
      const migratedChild = { ...oldChild, id: (Date.now() + 1).toString() };
      const updatedList = [...childrenList, migratedChild];
      await AsyncStorage.setItem('children_list', JSON.stringify(updatedList));
      await AsyncStorage.removeItem('child_profile');
    }

    console.log("Saved to Disk:", childrenList);
    router.back();
    
  } catch (e) {
    console.error("Save error:", e);
    Alert.alert("Error", "Failed to save data");
  }
};

  // Bellow AI generated form UI
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>{isEditMode ? 'Edit Child Profile' : 'New Child Profile'}</Text>

        {/* --- FORM FIELD: Full Name --- */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.fullName && styles.errorInput]}
                placeholder="e.g. Alex Johnson"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
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
                  placeholder="Yrs"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value?.toString()}
                />
              )}
            />
            {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Gender (Optional)</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="M / F / Other"
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
                  placeholder="cm"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value?.toString()}
                />
              )}
            />
            {errors.height && <Text style={styles.errorText}>{errors.height.message}</Text>}
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.weight && styles.errorInput]}
                  placeholder="kg"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value?.toString()}
                />
              )}
            />
            {errors.weight && <Text style={styles.errorText}>{errors.weight.message}</Text>}
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
                placeholder="Allergies, conditions, etc."
                multiline
                numberOfLines={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.medicalNotes && <Text style={styles.errorText}>{errors.medicalNotes.message}</Text>}
        </View>

        {/* --- SUBMIT BUTTON --- */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.buttonText}>{isEditMode ? 'Update Profile' : 'Save Child Profile'}</Text>
        </TouchableOpacity>

        {/* Spacer for bottom scrolling */}
        <View style={{ height: 40 }} /> 
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// AI gen CSS 
const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#1a1a1a',
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF0F0',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});