import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ChildProfile = {
  fullName: string;
  age: number;
  height: number;
  weight: number;
  gender?: string;
  medicalNotes?: string;
  id?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadChildren = async () => {
    try {
      // Try to load as array first (new format)
      const childrenJson = await AsyncStorage.getItem('children_list');
      if (childrenJson) {
        const childrenList = JSON.parse(childrenJson);
        setChildren(childrenList);
        return;
      }

      // Fallback: check for old single child format
      const oldChildJson = await AsyncStorage.getItem('child_profile');
      if (oldChildJson) {
        const oldChild = JSON.parse(oldChildJson);
        // Migrate to new format
        const migratedChild = { ...oldChild, id: Date.now().toString() };
        await AsyncStorage.setItem('children_list', JSON.stringify([migratedChild]));
        await AsyncStorage.removeItem('child_profile');
        setChildren([migratedChild]);
      } else {
        setChildren([]);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
    }
  };

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadChildren();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const handleDeleteChild = async (id: string, name: string) => {
    Alert.alert(
      'Delete Child',
      `Are you sure you want to delete ${name}'s profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedChildren = children.filter(child => child.id !== id);
              await AsyncStorage.setItem('children_list', JSON.stringify(updatedChildren));
              setChildren(updatedChildren);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete child profile');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">ChildGuard</ThemedText>
        <ThemedText style={styles.subtitle}>Your Child Profiles</ThemedText>
      </ThemedView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add_child')}>
        <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
        <ThemedText style={styles.addButtonText}>Add New Child</ThemedText>
      </TouchableOpacity>

      {children.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="person.circle" size={64} color="#999" />
          <ThemedText style={styles.emptyText}>No children added yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Tap "Add New Child" to create your first profile
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.childrenList}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              onPress={() => router.push({ pathname: '/add_child', params: { id: child.id } })}>
              <View style={styles.childCardHeader}>
                <View style={styles.childInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.childName}>
                    {child.fullName}
                  </ThemedText>
                  <ThemedText style={styles.childDetails}>
                    Age: {child.age} • {child.height}cm • {child.weight}kg
                    {child.gender && ` • ${child.gender}`}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteChild(child.id!, child.fullName);
                  }}
                  style={styles.deleteButton}>
                  <IconSymbol name="trash" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
              {child.medicalNotes && (
                <ThemedText style={styles.medicalNotes} numberOfLines={2}>
                  {child.medicalNotes}
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  childrenList: {
    gap: 12,
  },
  childCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  childCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
  medicalNotes: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
