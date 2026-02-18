import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, RefreshControl, Alert, Text, Platform } from 'react-native';
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
      return;
    }
    
    // Perform delete for web
    await performDelete(id);
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>ChildGuard</Text>
        <Text style={styles.subtitle}>Your Child Profiles</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add_child')}
        activeOpacity={0.8}>
        <View style={styles.addButtonCircle}>
          <IconSymbol name="plus" size={28} color="#007AFF" />
        </View>
        <Text style={styles.addButtonText}>Add New Child</Text>
      </TouchableOpacity>

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
        <View style={styles.childrenList}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
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
                  onPress={() => {
                    handleDeleteChild(child.id!, child.fullName);
                  }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  childrenList: {
    gap: 16,
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  childCardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0F0FF',
  },
  childInfoContainer: {
    flex: 1,
  },
  childInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  childName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  childDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    minWidth: 80,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notesLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0F0FF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
