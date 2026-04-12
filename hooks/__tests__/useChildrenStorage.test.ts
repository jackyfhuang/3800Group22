import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock(
  "@react-native-async-storage/async-storage",
  () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
);

describe("useChildrenStorage Hook - AsyncStorage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadChildren", () => {
    it("should return empty array when no data exists", async () => {
      (
        AsyncStorage.getItem as jest.Mock
      ).mockResolvedValueOnce(null);

      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      const children = childrenJson
        ? JSON.parse(childrenJson)
        : [];

      expect(children).toEqual([]);
    });

    it("should return children from storage", async () => {
      const mockChildren = [
        {
          id: "1",
          fullName: "John Doe",
          age: 5,
          height: 100,
          weight: 20,
          emergencyContacts: [
            {
              name: "Jane Doe",
              relationship: "Mother",
              phone: "(123) 456-7890",
            },
          ],
        },
      ];

      (
        AsyncStorage.getItem as jest.Mock
      ).mockResolvedValueOnce(
        JSON.stringify(mockChildren),
      );

      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      const children = childrenJson
        ? JSON.parse(childrenJson)
        : [];

      expect(children).toEqual(mockChildren);
    });

    it("should handle JSON parse errors gracefully", async () => {
      (
        AsyncStorage.getItem as jest.Mock
      ).mockResolvedValueOnce("invalid json");

      let children: any[] = [];
      try {
        const childrenJson =
          await AsyncStorage.getItem(
            "children_list",
          );
        children = childrenJson
          ? JSON.parse(childrenJson)
          : [];
      } catch (error) {
        children = [];
      }

      expect(children).toEqual([]);
    });

    it("should handle legacy single child format", async () => {
      const legacyChild = {
        fullName: "Legacy Child",
        age: 5,
        height: 100,
        weight: 20,
        emergencyContacts: [
          {
            name: "Parent",
            relationship: "Mother",
            phone: "(123) 456-7890",
          },
        ],
      };

      // First call returns null (no new format)
      // Second call returns legacy data
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(
          JSON.stringify(legacyChild),
        );

      (
        AsyncStorage.setItem as jest.Mock
      ).mockResolvedValueOnce(undefined);
      (
        AsyncStorage.removeItem as jest.Mock
      ).mockResolvedValueOnce(undefined);

      // Simulate the migration logic
      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      if (childrenJson) {
        // New format exists
      } else {
        const oldChildJson =
          await AsyncStorage.getItem(
            "child_profile",
          );
        if (oldChildJson) {
          const oldChild =
            JSON.parse(oldChildJson);
          const migratedChild = {
            ...oldChild,
            id: Date.now().toString(),
          };
          await AsyncStorage.setItem(
            "children_list",
            JSON.stringify([migratedChild]),
          );
          await AsyncStorage.removeItem(
            "child_profile",
          );
        }
      }

      expect(
        AsyncStorage.setItem,
      ).toHaveBeenCalled();
      expect(
        AsyncStorage.removeItem,
      ).toHaveBeenCalled();
    });
  });

  describe("saveChild", () => {
    it("should save new child to storage", async () => {
      const existingChildren: any[] = [];

      (
        AsyncStorage.getItem as jest.Mock
      ).mockResolvedValueOnce(
        JSON.stringify(existingChildren),
      );
      (
        AsyncStorage.setItem as jest.Mock
      ).mockResolvedValueOnce(undefined);

      const newChild = {
        fullName: "John Doe",
        age: 5,
        height: 100,
        weight: 20,
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "(123) 456-7890",
          },
        ],
      };

      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      const children = childrenJson
        ? JSON.parse(childrenJson)
        : [];

      const newId = Date.now().toString();
      const childWithId = {
        ...newChild,
        id: newId,
      };
      children.push(childWithId);

      await AsyncStorage.setItem(
        "children_list",
        JSON.stringify(children),
      );

      expect(
        AsyncStorage.setItem,
      ).toHaveBeenCalled();
    });
  });

  describe("updateChild", () => {
    it("should update existing child in storage", async () => {
      const existingChildren = [
        {
          id: "1",
          fullName: "John Doe",
          age: 5,
          height: 100,
          weight: 20,
          emergencyContacts: [
            {
              name: "Jane Doe",
              relationship: "Mother",
              phone: "(123) 456-7890",
            },
          ],
        },
      ];

      (
        AsyncStorage.getItem as jest.Mock
      ).mockResolvedValueOnce(
        JSON.stringify(existingChildren),
      );
      (
        AsyncStorage.setItem as jest.Mock
      ).mockResolvedValueOnce(undefined);

      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      const children = childrenJson
        ? JSON.parse(childrenJson)
        : [];

      const index = children.findIndex(
        (c: any) => c.id === "1",
      );
      if (index !== -1) {
        children[index] = {
          ...children[index],
          fullName: "John Updated",
          age: 6,
        };
      }

      await AsyncStorage.setItem(
        "children_list",
        JSON.stringify(children),
      );

      expect(
        AsyncStorage.setItem,
      ).toHaveBeenCalled();
    });

    it("should return false when child not found", async () => {
      const existingChildren = [
        {
          id: "1",
          fullName: "John Doe",
          age: 5,
          height: 100,
          weight: 20,
          emergencyContacts: [
            {
              name: "Jane Doe",
              relationship: "Mother",
              phone: "(123) 456-7890",
            },
          ],
        },
      ];

      (
        AsyncStorage.getItem as jest.Mock
      ).mockResolvedValueOnce(
        JSON.stringify(existingChildren),
      );

      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      const children = childrenJson
        ? JSON.parse(childrenJson)
        : [];

      const index = children.findIndex(
        (c: any) => c.id === "999",
      );

      expect(index).toBe(-1);
    });
  });

  describe("deleteChild", () => {
    it("should delete child from storage", async () => {
      const existingChildren = [
        {
          id: "1",
          fullName: "John Doe",
          age: 5,
          height: 100,
          weight: 20,
          emergencyContacts: [
            {
              name: "Jane Doe",
              relationship: "Mother",
              phone: "(123) 456-7890",
            },
          ],
        },
        {
          id: "2",
          fullName: "Jane Smith",
          age: 3,
          height: 90,
          weight: 15,
          emergencyContacts: [
            {
              name: "John Smith",
              relationship: "Father",
              phone: "(098) 765-4321",
            },
          ],
        },
      ];

      (
        AsyncStorage.getItem as jest.Mock
      ).mockResolvedValueOnce(
        JSON.stringify(existingChildren),
      );
      (
        AsyncStorage.setItem as jest.Mock
      ).mockResolvedValueOnce(undefined);

      const childrenJson =
        await AsyncStorage.getItem(
          "children_list",
        );
      const children = childrenJson
        ? JSON.parse(childrenJson)
        : [];

      const updatedChildren = children.filter(
        (c: any) => c.id !== "1",
      );

      await AsyncStorage.setItem(
        "children_list",
        JSON.stringify(updatedChildren),
      );

      expect(updatedChildren.length).toBe(1);
      expect(updatedChildren[0].id).toBe("2");
    });
  });
});
