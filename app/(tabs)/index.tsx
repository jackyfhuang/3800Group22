import { AppText } from '@/components/ui/app-text';
import {
  EmergencyQuickViewCard,
  EmergencyQuickViewModal,
} from '@/components/ui/emergency-quick-view';
import { HelpModal } from '@/components/ui/help-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { palette } from '@/constants/theme';
import { colors, radius, sharedStyles, spacing, homeStyles as styles, typography } from '@/styles';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
type ChildProfile = {
  id?: string;
  fullName?: string;
  age?: number;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  sex?: string;
  ethnicity?: string;
  height?: number;
  weight?: number;
  lifeThreatAllergies?: string;
  emergencyMedications?: string;
  communicationNeeds?: string;
  languageSpoken?: string;
  otherMedicalNotes?: string;
  guardian1?: { name?: string; phone?: string; address?: string };
  guardian2?: { name?: string; phone?: string; address?: string };
  emergencyContacts?: Array<{
    name?: string;
    relationship?: string;
    phone?: string;
    address?: string;
  }>;
  eyeColor?: string;
  eyeColorOther?: string;
  hairColor?: string;
  hairColorOther?: string;
  hairStyle?: string;
  topColor?: string;
  pantsColor?: string;
  hasHat?: boolean;
  hasGlasses?: boolean;
  hasHearingAids?: boolean;
  lastUpdated?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  // ─── Data Handlers ──────────────────────────────────────────────────────────
  const loadChildren = async () => {
    try {
      const childrenJson = await AsyncStorage.getItem('children_list');
      if (childrenJson) {
        setChildren(JSON.parse(childrenJson));
        return;
      }
      // Migrate old single-child format
      const oldChildJson = await AsyncStorage.getItem('child_profile');
      if (oldChildJson) {
        const oldChild = JSON.parse(oldChildJson);
        const migrated = { ...oldChild, id: Date.now().toString() };
        await AsyncStorage.setItem('children_list', JSON.stringify([migrated]));
        await AsyncStorage.removeItem('child_profile');
        setChildren([migrated]);
      } else {
        setChildren([]);
      }
    } catch {
      setChildren([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChildren();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const performDelete = async (id: string) => {
    try {
      const updated = children.filter((c) => c.id !== id);
      await AsyncStorage.setItem('children_list', JSON.stringify(updated));
      setChildren(updated);
    } catch {
      Alert.alert('Error', 'Failed to delete child profile');
    }
  };

  const handleDeleteChild = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined' && window.confirm
          ? window.confirm(`Delete ${name}'s profile?`)
          : true;
      if (ok) performDelete(id);
    } else {
      Alert.alert('Delete Profile', `Remove ${name}'s profile? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => performDelete(id) },
      ]);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* ── Frozen Header ────────────────────────────────────────────────── */}
      <View style={localStyles.header}>
        <View style={{ flex: 1 }}>
          <AppText style={localStyles.appTitle}>ChildGuard</AppText>
          <AppText style={localStyles.appSubtitle}>
            {children.length === 0
              ? 'Keep your family safe'
              : `${children.length} profile${children.length > 1 ? 's' : ''} saved`}
          </AppText>
        </View>
        <Pressable
          onPress={() => setShowHelp(true)}
          style={({ pressed }) => [localStyles.iconBtn, pressed && localStyles.iconBtnPressed]}
        >
          <MaterialIcons name="info-outline" size={22} color={palette.navy} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Emergency Quick-View Card ─────────────────────────────────── */}
        {children.length > 0 && (
          <EmergencyQuickViewCard onPress={() => setShowEmergency(true)} />
        )}

        {/* ── Profile List or Empty State ───────────────────────────────── */}
        {children.length === 0 ? (
          <View style={localStyles.emptyState}>
            <View style={localStyles.emptyIconCircle}>
              <MaterialIcons name="child-care" size={52} color={palette.teal} />
            </View>
            <AppText style={localStyles.emptyTitle}>No profiles yet</AppText>
            <AppText style={localStyles.emptySubtitle}>
              Add your first child profile so you're always prepared
            </AppText>
          </View>
        ) : (
          <View style={styles.childrenList}>
            {children.map((child) => {
              const name =
                child.fullName ||
                `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() ||
                'Unnamed Child';
              return (
                <TouchableOpacity
                  key={child.id}
                  style={sharedStyles.card}
                  onPress={() =>
                    router.push({ pathname: '/view_child', params: { id: child.id } })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.childCardContent}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatarCircle}>
                        <IconSymbol name="person.fill" size={32} color={palette.blue} />
                      </View>
                    </View>

                    {/* Info */}
                    <View style={styles.childInfoContainer}>
                      <AppText style={styles.childName}>{name}</AppText>
                      <View style={styles.childDetailsContainer}>
                        {child.age !== undefined && (
                          <View style={styles.detailItem}>
                            <AppText style={styles.detailLabel}>Age</AppText>
                            <AppText style={styles.detailValue}>{child.age} yrs</AppText>
                          </View>
                        )}
                        <LastUpdatedPill lastUpdated={child.lastUpdated} />
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        router.push({ pathname: '/add_child', params: { id: child.id } })
                      }
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="edit" size={16} color={palette.teal} />
                      <AppText style={styles.editButtonText}>Edit</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteChild(child.id!, name)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="delete-outline" size={16} color={palette.red} />
                      <AppText style={styles.deleteButtonText}>Delete</AppText>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Add Child Button ──────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add_child')}
          activeOpacity={0.8}
        >
          <View style={styles.addButtonCircle}>
            <MaterialIcons name="add" size={28} color={palette.teal} />
          </View>
          <AppText style={styles.addButtonText}>Add New Child</AppText>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Add FAB ──────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={localStyles.fab}
        onPress={() => router.push('/add_child')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={30} color={palette.white} />
      </TouchableOpacity>

      {/* ── Emergency Quick View FAB ─────────────────────────────────────── */}
      {children.length > 0 && (
        <TouchableOpacity
          style={localStyles.emergencyFab}
          onPress={() => setShowEmergency(true)}
          activeOpacity={0.85}
        >
          <MaterialIcons name="local-police" size={26} color={palette.white} />
        </TouchableOpacity>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
      <EmergencyQuickViewModal
        visible={showEmergency}
        profiles={children}
        onClose={() => setShowEmergency(false)}
      />
    </View>
  );
}

// ─── Last Updated Pill ────────────────────────────────────────────────────────
function LastUpdatedPill({ lastUpdated }: { lastUpdated?: string }) {
  let value: string;
  let bg: string;
  let textColor: string;
  let icon: React.ComponentProps<typeof MaterialIcons>['name'];

  if (!lastUpdated) {
    value = 'Never';
    bg = colors.cardBorder;
    textColor = colors.textSubtle;
    icon = 'warning';
  } else {
    const days = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86_400_000);
    const months = Math.floor(days / 30);
    value = days === 0 ? 'Today' : days < 30 ? `${days}d ago` : months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}yr ago`;

    if (days < 90) {
      bg = '#E6F7F0';
      textColor = '#1A7A4A';
      icon = 'check-circle';
    } else if (days < 180) {
      bg = '#FFF8E6';
      textColor = '#A06000';
      icon = 'add-alert';
    } else {
      bg = '#FFF8E6';
      textColor = '#A06000';
      icon = 'warning';
    }
  }

  return (
    <View style={pillStyles.container}>
      <AppText style={styles.detailLabel}>Updated</AppText>
      <View style={[pillStyles.pill, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={12} color={textColor} />
        <AppText style={[styles.detailValue, { color: textColor }]}>{value}</AppText>
      </View>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  container: {
    minWidth: 80,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.appBackground,
  },
  appTitle: {
    fontSize: typography.hero,
    fontWeight: '800',
    color: palette.navy,
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBtnPressed: {
    shadowColor: palette.amber,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    borderColor: palette.amber,
    elevation: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.xxl,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.secondaryBorder,
  },
  emptyTitle: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: palette.navy,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.default,
    color: colors.textSubtle,
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 56,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: palette.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  emergencyFab: {
    position: 'absolute',
    bottom: 130,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: palette.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
