import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, RefreshControl, Alert, Text, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { homeStyles as styles, sharedStyles } from '@/styles';

// ─── Types ────────────────────────────────────────────────────────────────────
type ChildProfile = {
  fullName: string;
  age: number;
  height: number;
  weight: number;
  gender?: string;
  medicalNotes?: string;
  id?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Data Handlers ────────────────────────────────────────────────────────
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

  const performDelete = async (id: string) => {
    try {
      console.log('Deleting child:', id);
      const updatedChildren = children.filter(child => child.id !== id);
      await AsyncStorage.setItem('children_list', JSON.stringify(updatedChildren));
      setChildren(updatedChildren);
      console.log('Child deleted successfully');
      if (Platform.OS === 'web') {
        alert('Child profile deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      if (Platform.OS === 'web') {
        alert('Failed to delete child profile');
      } else {
        Alert.alert('Error', 'Failed to delete child profile');
      }
    }
  };

  const handleDeleteChild = async (id: string, name: string) => {
    console.log('Delete button clicked for:', id, name);

    // For web, use window.confirm, for mobile use Alert
    if (Platform.OS === 'web') {
      const confirmed = (typeof window !== 'undefined' && window.confirm)
        ? window.confirm(`Are you sure you want to delete ${name}'s profile?`)
        : true;
      if (!confirmed) {
        console.log('Delete cancelled');
        return;
      }
      await performDelete(id);
    } else {
      Alert.alert(
        'Delete Child',
        `Are you sure you want to delete ${name}'s profile?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => console.log('Delete cancelled') },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await performDelete(id);
            },
          },
        ]
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ChildGuard</Text>
        <Text style={styles.subtitle}>Your Child Profiles</Text>
      </View>

      {/* Add Child Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add_child')}
        activeOpacity={0.8}>
        <View style={styles.addButtonCircle}>
          <IconSymbol name="plus" size={28} color="#007AFF" />
        </View>
        <Text style={styles.addButtonText}>Add New Child</Text>
      </TouchableOpacity>

      {/* Empty State */}
      {children.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <IconSymbol name="person.circle" size={80} color="#D0D0D0" />
          </View>
          <Text style={styles.emptyText}>No profiles yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first child profile to get started
          </Text>
        </View>
      ) : (
        // Child Cards
        <View style={styles.childrenList}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={sharedStyles.card}
              onPress={() => router.push({ pathname: '/add_child', params: { id: child.id } })}
              activeOpacity={0.7}>
              <View style={styles.childCardContent}>

                {/* Avatar Circle */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarCircle}>
                    <IconSymbol name="person.fill" size={32} color="#007AFF" />
                  </View>
                </View>

                {/* Child Info */}
                <View style={styles.childInfoContainer}>
                  <View style={styles.childInfoRow}>
                    <Text style={styles.childName}>
                      {child.fullName || 'Unnamed Child'}
                    </Text>
                    <IconSymbol name="chevron.right" size={20} color="#999" />
                  </View>

                  <View style={styles.childDetailsContainer}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Age</Text>
                      <Text style={styles.detailValue}>{child.age} yrs</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Height</Text>
                      <Text style={styles.detailValue}>{child.height} cm</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Weight</Text>
                      <Text style={styles.detailValue}>{child.weight} kg</Text>
                    </View>
                    {child.gender && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Gender</Text>
                        <Text style={styles.detailValue}>{child.gender}</Text>
                      </View>
                    )}
                  </View>

                  {child.medicalNotes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Medical Notes</Text>
                      <Text style={styles.notesText} numberOfLines={2}>
                        {child.medicalNotes}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push({ pathname: '/add_child', params: { id: child.id } })}
                  activeOpacity={0.7}>
                  <IconSymbol name="pencil" size={16} color="#007AFF" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteChild(child.id!, child.fullName)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}>
                  <IconSymbol name="trash" size={16} color="#FF4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}