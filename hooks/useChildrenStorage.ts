import {
    ChildFormData,
    ChildProfile,
} from "@/types/child";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

const STORAGE_KEY = "children_list";
const LEGACY_STORAGE_KEY = "child_profile";

export function useChildrenStorage() {
  // Load all children from storage
  const loadChildren =
    useCallback(async (): Promise<
      ChildProfile[]
    > => {
      try {
        // Try to load as array first (new format)
        const childrenJson =
          await AsyncStorage.getItem(STORAGE_KEY);
        if (childrenJson) {
          return JSON.parse(childrenJson);
        }

        // Fallback: check for old single child format
        const oldChildJson =
          await AsyncStorage.getItem(
            LEGACY_STORAGE_KEY,
          );
        if (oldChildJson) {
          const oldChild =
            JSON.parse(oldChildJson);
          // Migrate to new format
          const migratedChild: ChildProfile = {
            ...oldChild,
            id: Date.now().toString(),
          };
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([migratedChild]),
          );
          await AsyncStorage.removeItem(
            LEGACY_STORAGE_KEY,
          );
          return [migratedChild];
        }

        return [];
      } catch (error) {
        console.error(
          "Error loading children:",
          error,
        );
        return [];
      }
    }, []);

  // Load a single child by ID
  const loadChild = useCallback(
    async (
      childId: string,
    ): Promise<ChildProfile | null> => {
      try {
        const children = await loadChildren();
        return (
          children.find(
            (c) => c.id === childId,
          ) || null
        );
      } catch (error) {
        console.error(
          "Error loading child:",
          error,
        );
        return null;
      }
    },
    [loadChildren],
  );

  // Save a new child
  const saveChild = useCallback(
    async (
      data: ChildFormData,
    ): Promise<string> => {
      const children = await loadChildren();
      const newId = Date.now().toString();
      const newChild: ChildProfile = {
        ...data,
        id: newId,
      };
      children.push(newChild);
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(children),
      );
      return newId;
    },
    [loadChildren],
  );

  // Update an existing child
  const updateChild = useCallback(
    async (
      childId: string,
      data: ChildFormData,
    ): Promise<boolean> => {
      try {
        const children = await loadChildren();
        const index = children.findIndex(
          (c) => c.id === childId,
        );
        if (index === -1) return false;
        children[index] = {
          ...data,
          id: childId,
        };
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(children),
        );
        return true;
      } catch (error) {
        console.error(
          "Error updating child:",
          error,
        );
        return false;
      }
    },
    [loadChildren],
  );

  // Save or update a child (handles both create and edit)
  const saveOrUpdateChild = useCallback(
    async (
      data: ChildFormData,
      existingId?: string,
    ): Promise<string | null> => {
      try {
        if (existingId) {
          const success = await updateChild(
            existingId,
            data,
          );
          return success ? existingId : null;
        }
        return await saveChild(data);
      } catch (error) {
        console.error(
          "Error saving child:",
          error,
        );
        return null;
      }
    },
    [saveChild, updateChild],
  );

  // Delete a child by ID
  const deleteChild = useCallback(
    async (childId: string): Promise<boolean> => {
      try {
        const children = await loadChildren();
        const updatedChildren = children.filter(
          (c) => c.id !== childId,
        );
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedChildren),
        );
        return true;
      } catch (error) {
        console.error(
          "Error deleting child:",
          error,
        );
        return false;
      }
    },
    [loadChildren],
  );

  return {
    loadChildren,
    loadChild,
    saveChild,
    updateChild,
    saveOrUpdateChild,
    deleteChild,
  };
}
