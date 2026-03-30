import { AppText } from "@/components/ui/app-text";
import {
  EmergencyQuickViewCard,
  EmergencyQuickViewModal,
} from "@/components/ui/emergency-quick-view";
import { HelpModal } from "@/components/ui/help-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { palette } from "@/constants/theme";
import {
  colors,
  radius,
  sharedStyles,
  spacing,
  homeStyles as styles,
  typography,
} from "@/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChildFolder = {
  id: string;
  name: string;
  childIds: string[];
  createdAt: string;
};

type ChildProfile = {
  id?: string;
  imageUri?: string;
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
  emergencyContacts?: {
    name?: string;
    relationship?: string;
    phone?: string;
    address?: string;
  }[];
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
  const [viewMode, setViewMode] = useState<"all" | "folders">("all");
  const [folders, setFolders] = useState<ChildFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [folderModalTitle, setFolderModalTitle] = useState("");
  const [folderModalValue, setFolderModalValue] = useState("");
  const [folderModalCallback, setFolderModalCallback] = useState<
    ((value: string) => void) | null
  >(null);

  // ─── Data Handlers ──────────────────────────────────────────────────────────
  const loadChildren = async () => {
    try {
      const childrenJson = await AsyncStorage.getItem("children_list");
      if (childrenJson) {
        setChildren(JSON.parse(childrenJson));
        return;
      }
      // Migrate old single-child format
      const oldChildJson = await AsyncStorage.getItem("child_profile");
      if (oldChildJson) {
        const oldChild = JSON.parse(oldChildJson);
        const migrated = { ...oldChild, id: Date.now().toString() };
        await AsyncStorage.setItem("children_list", JSON.stringify([migrated]));
        await AsyncStorage.removeItem("child_profile");
        setChildren([migrated]);
      } else {
        setChildren([]);
      }
    } catch {
      setChildren([]);
    }
  };

  const loadFolders = async () => {
    try {
      const json = await AsyncStorage.getItem("child_folders");
      if (json) setFolders(JSON.parse(json));
      else setFolders([]);
    } catch {
      setFolders([]);
    }
  };

  const saveFolders = async (updated: ChildFolder[]) => {
    setFolders(updated);
    await AsyncStorage.setItem("child_folders", JSON.stringify(updated));
  };

  useFocusEffect(
    useCallback(() => {
      loadChildren();
      loadFolders();
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
      await AsyncStorage.setItem("children_list", JSON.stringify(updated));
      setChildren(updated);
    } catch {
      Alert.alert("Error", "Failed to delete child profile");
    }
  };

  const handleDeleteChild = (id: string, name: string) => {
    if (Platform.OS === "web") {
      const ok =
        typeof window !== "undefined" && window.confirm
          ? window.confirm(`Delete ${name}'s profile?`)
          : true;
      if (ok) performDelete(id);
    } else {
      Alert.alert(
        "Delete Profile",
        `Remove ${name}'s profile? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => performDelete(id),
          },
        ],
      );
    }
  };

  // ─── Folder Handlers ────────────────────────────────────────────────────────
  const showFolderInput = (
    title: string,
    defaultValue: string,
    callback: (value: string) => void,
  ) => {
    setFolderModalTitle(title);
    setFolderModalValue(defaultValue);
    setFolderModalCallback(() => callback);
    setFolderModalVisible(true);
  };

  const handleCreateFolder = () => {
    showFolderInput("New Folder", "", (name) => {
      if (!name.trim()) return;
      const newFolder: ChildFolder = {
        id: Date.now().toString(),
        name: name.trim(),
        childIds: [],
        createdAt: new Date().toISOString(),
      };
      saveFolders([...folders, newFolder]);
    });
  };

  const handleRenameFolder = (folderId: string, currentName: string) => {
    showFolderInput("Rename Folder", currentName, (name) => {
      if (!name.trim()) return;
      const updated = folders.map((f) =>
        f.id === folderId ? { ...f, name: name.trim() } : f,
      );
      saveFolders(updated);
    });
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    Alert.alert(
      "Delete Folder",
      `Delete "${folderName}"? Children inside won't be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            saveFolders(folders.filter((f) => f.id !== folderId));
            if (activeFolderId === folderId) setActiveFolderId(null);
          },
        },
      ],
    );
  };

  const handleAddChildToFolder = (childId: string) => {
    if (folders.length === 0) {
      Alert.alert("No Folders", "Create a folder first.");
      return;
    }
    const options = folders.map((f) => f.name);
    options.push("Cancel");
    Alert.alert("Add to Folder", "Choose a folder:", [
      ...folders.map((f) => ({
        text: f.name,
        onPress: () => {
          if (f.childIds.includes(childId)) return;
          const updated = folders.map((folder) =>
            folder.id === f.id
              ? { ...folder, childIds: [...folder.childIds, childId] }
              : folder,
          );
          saveFolders(updated);
        },
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleRemoveChildFromFolder = (
    folderId: string,
    childId: string,
    childName: string,
  ) => {
    Alert.alert(
      "Remove from Folder",
      `Remove ${childName} from this folder?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updated = folders.map((f) =>
              f.id === folderId
                ? { ...f, childIds: f.childIds.filter((id) => id !== childId) }
                : f,
            );
            saveFolders(updated);
          },
        },
      ],
    );
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const displayChildren =
    viewMode === "folders" && activeFolder
      ? children.filter((c) => c.id && activeFolder.childIds.includes(c.id))
      : children;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* ── Frozen Header ────────────────────────────────────────────────── */}
      <View style={localStyles.header}>
        <View style={{ flex: 1 }}>
          <AppText style={localStyles.appTitle}>ChildGuard</AppText>
          <AppText style={localStyles.appSubtitle}>
            {children.length === 0
              ? "Keep your family safe"
              : `${children.length} profile${children.length > 1 ? "s" : ""} saved`}
          </AppText>
        </View>
        <Pressable
          onPress={() => setShowHelp(true)}
          style={({ pressed }) => [
            localStyles.iconBtn,
            pressed && localStyles.iconBtnPressed,
          ]}
        >
          <MaterialIcons name="info-outline" size={22} color={palette.navy} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 100 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ── Emergency Quick-View Card ─────────────────────────────────── */}
        {children.length > 0 && (
          <EmergencyQuickViewCard onPress={() => setShowEmergency(true)} />
        )}

        {/* ── View Mode Toggle ──────────────────────────────────────────── */}
        {children.length > 0 && (
          <View style={localStyles.viewToggle}>
            <TouchableOpacity
              style={[
                localStyles.toggleButton,
                viewMode === "all" && localStyles.toggleButtonActive,
              ]}
              onPress={() => {
                setViewMode("all");
                setActiveFolderId(null);
              }}
            >
              <AppText
                style={[
                  localStyles.toggleText,
                  viewMode === "all" && localStyles.toggleTextActive,
                ]}
              >
                All
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                localStyles.toggleButton,
                viewMode === "folders" && localStyles.toggleButtonActive,
              ]}
              onPress={() => setViewMode("folders")}
            >
              <AppText
                style={[
                  localStyles.toggleText,
                  viewMode === "folders" && localStyles.toggleTextActive,
                ]}
              >
                Folders
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Folders View ─────────────────────────────────────────────── */}
        {viewMode === "folders" && !activeFolderId && children.length > 0 && (
          <View style={styles.childrenList}>
            {folders.map((folder) => {
              const count = folder.childIds.filter((id) =>
                children.some((c) => c.id === id),
              ).length;
              return (
                <TouchableOpacity
                  key={folder.id}
                  style={[sharedStyles.card, localStyles.folderCard]}
                  onPress={() => setActiveFolderId(folder.id)}
                  onLongPress={() =>
                    Alert.alert(folder.name, "Choose an action:", [
                      {
                        text: "Rename",
                        onPress: () =>
                          handleRenameFolder(folder.id, folder.name),
                      },
                      {
                        text: "Delete Folder",
                        style: "destructive",
                        onPress: () =>
                          handleDeleteFolder(folder.id, folder.name),
                      },
                      { text: "Cancel", style: "cancel" },
                    ])
                  }
                  activeOpacity={0.7}
                >
                  <View style={localStyles.folderCardContent}>
                    <MaterialIcons
                      name="folder"
                      size={32}
                      color={palette.teal}
                    />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <AppText style={localStyles.folderName}>
                        {folder.name}
                      </AppText>
                      <AppText style={localStyles.folderCount}>
                        {count} {count === 1 ? "child" : "children"}
                      </AppText>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={colors.textSubtle}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[sharedStyles.secondaryButton, { marginTop: spacing.md }]}
              onPress={handleCreateFolder}
            >
              <AppText variant="label" style={sharedStyles.secondaryButtonText}>
                + New Folder
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Folder Breadcrumb ────────────────────────────────────────── */}
        {viewMode === "folders" && activeFolder && (
          <View style={localStyles.breadcrumb}>
            <TouchableOpacity
              onPress={() => setActiveFolderId(null)}
              style={localStyles.breadcrumbBack}
            >
              <MaterialIcons
                name="arrow-back"
                size={20}
                color={palette.teal}
              />
              <AppText style={localStyles.breadcrumbText}>Folders</AppText>
            </TouchableOpacity>
            <AppText style={localStyles.breadcrumbFolder}>
              {activeFolder.name}
            </AppText>
          </View>
        )}

        {/* ── Profile List or Empty State ───────────────────────────────── */}
        {children.length === 0 ? (
          <View style={localStyles.emptyState}>
            <View style={localStyles.emptyIconCircle}>
              <MaterialIcons name="child-care" size={52} color={palette.teal} />
            </View>
            <AppText style={localStyles.emptyTitle}>No profiles yet</AppText>
            <AppText style={localStyles.emptySubtitle}>
              Add your first child profile so you&apos;re always prepared
            </AppText>
          </View>
        ) : viewMode === "folders" && !activeFolderId ? null : (
          <View style={styles.childrenList}>
            {displayChildren.length === 0 && activeFolderId && (
              <View style={localStyles.emptyState}>
                <AppText style={localStyles.emptySubtitle}>
                  No children in this folder yet. Use "Add to Folder" from the
                  All view.
                </AppText>
              </View>
            )}
            {displayChildren.map((child) => {
              const name =
                child.fullName ||
                `${child.firstName ?? ""} ${child.lastName ?? ""}`.trim() ||
                "Unnamed Child";
              return (
                <TouchableOpacity
                  key={child.id}
                  style={sharedStyles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/view_child",
                      params: { id: child.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.childCardContent}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatarCircle}>
                        {child.imageUri ? (
                          <Image
                            source={{ uri: child.imageUri }}
                            style={{ width: 64, height: 64, borderRadius: 32 }}
                          />
                        ) : (
                          <IconSymbol
                            name="person.fill"
                            size={32}
                            color={palette.blue}
                          />
                        )}
                      </View>
                    </View>

                    {/* Info */}
                    <View style={styles.childInfoContainer}>
                      <AppText style={styles.childName}>{name}</AppText>
                      <View style={styles.childDetailsContainer}>
                        {child.age !== undefined && (
                          <View style={styles.detailItem}>
                            <AppText style={styles.detailLabel}>Age</AppText>
                            <AppText style={styles.detailValue}>
                              {child.age} yrs
                            </AppText>
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
                        router.push({
                          pathname: "/(tabs)/add_child",
                          params: { id: child.id },
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name="edit"
                        size={16}
                        color={palette.teal}
                      />
                      <AppText style={styles.editButtonText}>Edit</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteChild(child.id!, name)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={16}
                        color={palette.red}
                      />
                      <AppText style={styles.deleteButtonText}>Delete</AppText>
                    </TouchableOpacity>
                    {viewMode === "all" && (
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleAddChildToFolder(child.id!)}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons
                          name="folder-open"
                          size={16}
                          color={palette.teal}
                        />
                        <AppText style={styles.editButtonText}>Folder</AppText>
                      </TouchableOpacity>
                    )}
                    {viewMode === "folders" && activeFolderId && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          handleRemoveChildFromFolder(
                            activeFolderId,
                            child.id!,
                            name,
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <MaterialIcons
                          name="folder-off"
                          size={16}
                          color={palette.red}
                        />
                        <AppText style={styles.deleteButtonText}>
                          Remove
                        </AppText>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Add Child Button ──────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/add_child")}
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
        onPress={() => router.push("/(tabs)/add_child")}
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

      {/* ── Folder Name Input Modal ─────────────────────────────────────── */}
      <Modal
        visible={folderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFolderModalVisible(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <AppText style={localStyles.modalTitle}>
              {folderModalTitle}
            </AppText>
            <TextInput
              style={localStyles.modalInput}
              value={folderModalValue}
              onChangeText={setFolderModalValue}
              placeholder="Folder name"
              autoFocus
            />
            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={localStyles.modalCancelButton}
                onPress={() => setFolderModalVisible(false)}
              >
                <AppText style={localStyles.modalCancelText}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={localStyles.modalConfirmButton}
                onPress={() => {
                  setFolderModalVisible(false);
                  folderModalCallback?.(folderModalValue);
                }}
              >
                <AppText style={localStyles.modalConfirmText}>Done</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Last Updated Pill ────────────────────────────────────────────────────────
function LastUpdatedPill({ lastUpdated }: { lastUpdated?: string }) {
  let value: string;
  let bg: string;
  let textColor: string;
  let icon: React.ComponentProps<typeof MaterialIcons>["name"];

  if (!lastUpdated) {
    value = "Never";
    bg = colors.cardBorder;
    textColor = colors.textSubtle;
    icon = "warning";
  } else {
    const days = Math.floor(
      (Date.now() - new Date(lastUpdated).getTime()) / 86_400_000,
    );
    const months = Math.floor(days / 30);
    value =
      days === 0
        ? "Today"
        : days < 30
          ? `${days}d ago`
          : months < 12
            ? `${months}mo ago`
            : `${Math.floor(months / 12)}yr ago`;

    if (days < 90) {
      bg = "#E6F7F0";
      textColor = "#1A7A4A";
      icon = "check-circle";
    } else if (days < 180) {
      bg = "#FFF8E6";
      textColor = "#A06000";
      icon = "add-alert";
    } else {
      bg = "#FFF8E6";
      textColor = "#A06000";
      icon = "warning";
    }
  }

  return (
    <View style={pillStyles.container}>
      <AppText style={styles.detailLabel}>Updated</AppText>
      <View style={[pillStyles.pill, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={12} color={textColor} />
        <AppText style={[styles.detailValue, { color: textColor }]}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  container: {
    minWidth: 80,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const localStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.appBackground,
  },
  appTitle: {
    fontSize: typography.hero,
    fontWeight: "800",
    color: palette.navy,
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: typography.body,
    fontWeight: "500",
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
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
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: spacing.xxl,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.secondaryBorder,
  },
  emptyTitle: {
    fontSize: typography.heading,
    fontWeight: "700",
    color: palette.navy,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.default,
    color: colors.textSubtle,
    textAlign: "center",
    lineHeight: 24,
  },
  fab: {
    position: "absolute",
    bottom: 56,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: palette.teal,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: 3,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm - 2,
  },
  toggleButtonActive: {
    backgroundColor: palette.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.textSubtle,
  },
  toggleTextActive: {
    color: palette.navy,
  },
  folderCard: {
    marginBottom: spacing.sm,
  },
  folderCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  folderName: {
    fontSize: typography.default,
    fontWeight: "700",
    color: palette.navy,
  },
  folderCount: {
    fontSize: typography.small,
    color: colors.textSubtle,
    marginTop: 2,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  breadcrumbBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  breadcrumbText: {
    fontSize: typography.body,
    color: palette.teal,
    fontWeight: "600",
  },
  breadcrumbFolder: {
    fontSize: typography.body,
    color: palette.navy,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  modalContent: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: typography.subtitle,
    fontWeight: "700",
    color: palette.navy,
    marginBottom: spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: typography.default,
    color: palette.navy,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
  modalCancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  modalCancelText: {
    fontSize: typography.default,
    color: colors.textSubtle,
    fontWeight: "600",
  },
  modalConfirmButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.teal,
    borderRadius: radius.sm,
  },
  modalConfirmText: {
    fontSize: typography.default,
    color: palette.white,
    fontWeight: "600",
  },
  emergencyFab: {
    position: "absolute",
    bottom: 130,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: palette.red,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
