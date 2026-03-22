import {
  childSchema,
  defaultEmergencyContact,
  emergencyContactSchema,
  getDefaultChildFormData,
} from "@/types/child";

describe("childSchema - Validation Tests", () => {
  // ─── Full Name Validation ─────────────────────────────────────────────────────
  describe("fullName validation", () => {
    it("should accept valid full name (2+ characters)", () => {
      const validData = {
        fullName: "John Doe",
        age: "5",
        height: "100",
        weight: "20",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject full name with less than 2 characters", () => {
      const invalidData = {
        fullName: "J",
        age: "5",
        height: "100",
        weight: "20",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues[0].message,
        ).toBe(
          "Name must be at least 2 characters",
        );
      }
    });

    it("should reject empty full name", () => {
      const invalidData = {
        fullName: "",
        age: "5",
        height: "100",
        weight: "20",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ─── Age Validation ───────────────────────────────────────────────────────────
  describe("age validation", () => {
    it("should accept valid age (0-18)", () => {
      const validData = {
        fullName: "John Doe",
        age: "10",
        height: "100",
        weight: "20",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept age 0", () => {
      const validData = {
        fullName: "John Doe",
        age: "0",
        height: "50",
        weight: "5",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept age 18", () => {
      const validData = {
        fullName: "John Doe",
        age: "18",
        height: "180",
        weight: "70",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ─── Height Validation ────────────────────────────────────────────────────────
  describe("height validation", () => {
    it("should accept valid height (30-250 cm)", () => {
      const validData = {
        fullName: "John Doe",
        age: "5",
        height: "120",
        weight: "20",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept minimum height (30)", () => {
      const validData = {
        fullName: "John Doe",
        age: "0",
        height: "30",
        weight: "5",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept maximum height (250)", () => {
      const validData = {
        fullName: "John Doe",
        age: "18",
        height: "250",
        weight: "100",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ─── Weight Validation ────────────────────────────────────────────────────────
  describe("weight validation", () => {
    it("should accept valid weight (2-200 kg)", () => {
      const validData = {
        fullName: "John Doe",
        age: "5",
        height: "100",
        weight: "20",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept minimum weight (2)", () => {
      const validData = {
        fullName: "John Doe",
        age: "0",
        height: "50",
        weight: "2",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept maximum weight (200)", () => {
      const validData = {
        fullName: "John Doe",
        age: "18",
        height: "200",
        weight: "200",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ─── Medical Notes Validation ─────────────────────────────────────────────────
  describe("medicalNotes validation", () => {
    it("should accept medical notes within 300 characters", () => {
      const validData = {
        fullName: "John Doe",
        age: "5",
        height: "100",
        weight: "20",
        medicalNotes: "Allergic to peanuts",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty medical notes", () => {
      const validData = {
        fullName: "John Doe",
        age: "5",
        height: "100",
        weight: "20",
        medicalNotes: "",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ─── Emergency Contacts Validation ────────────────────────────────────────────
  describe("emergencyContacts validation", () => {
    it("should require at least one emergency contact", () => {
      const invalidData = {
        fullName: "John Doe",
        age: "5",
        height: "100",
        weight: "20",
        emergencyContacts: [],
      };
      const result =
        childSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues[0].message,
        ).toBe("At least one contact required");
      }
    });

    it("should accept valid emergency contact", () => {
      const validData = {
        fullName: "John Doe",
        age: "5",
        height: "100",
        weight: "20",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept multiple emergency contacts", () => {
      const validData = {
        fullName: "John Doe",
        age: "5",
        height: "100",
        weight: "20",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
          {
            name: "John Sr",
            relationship: "Father",
            phone: "098-765-4321",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ─── Optional Fields ──────────────────────────────────────────────────────────
  describe("optional fields", () => {
    it("should accept valid data with all optional fields empty", () => {
      const validData = {
        fullName: "John Doe",
        age: "5",
        height: "100",
        weight: "20",
        gender: "",
        medicalNotes: "",
        hasBirthmarks: "",
        birthmarksDescription: "",
        hasScars: "",
        scarsDescription: "",
        hasIdentifyingFeatures: "",
        identifyingFeaturesDescription: "",
        lastKnownLocation: "",
        schoolDaycareType: "",
        schoolDaycareName: "",
        sportsTeams: "",
        parent1Name: "",
        parent1Address: "",
        parent1Phone: "",
        parent2Name: "",
        parent2Address: "",
        parent2Phone: "",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept valid data with all fields populated", () => {
      const validData = {
        fullName: "John Doe",
        imageUri: "file://image.jpg",
        age: "5",
        height: "100",
        weight: "20",
        gender: "male",
        medicalNotes: "Allergic to peanuts",
        hasBirthmarks: "yes",
        birthmarksDescription:
          "Small birthmark on left arm",
        hasScars: "yes",
        scarsDescription: "Scar on knee",
        hasIdentifyingFeatures: "yes",
        identifyingFeaturesDescription: "Glasses",
        lastKnownLocation: "Home",
        schoolDaycareType: "Daycare",
        schoolDaycareName: "Sunshine Daycare",
        sportsTeams: "Soccer",
        parent1Name: "Jane Doe",
        parent1Address: "123 Main St",
        parent1Phone: "123-456-7890",
        parent2Name: "John Sr",
        parent2Address: "123 Main St",
        parent2Phone: "098-765-4321",
        emergencyContacts: [
          {
            name: "Jane Doe",
            relationship: "Mother",
            phone: "123-456-7890",
          },
        ],
      };
      const result =
        childSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe("emergencyContactSchema - Validation Tests", () => {
  describe("name validation", () => {
    it("should accept valid name", () => {
      const validData = {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "123-456-7890",
      };
      const result =
        emergencyContactSchema.safeParse(
          validData,
        );
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        relationship: "Mother",
        phone: "123-456-7890",
      };
      const result =
        emergencyContactSchema.safeParse(
          invalidData,
        );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues[0].message,
        ).toBe("Name is required");
      }
    });
  });

  describe("phone validation", () => {
    it("should accept valid phone", () => {
      const validData = {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "123-456-7890",
      };
      const result =
        emergencyContactSchema.safeParse(
          validData,
        );
      expect(result.success).toBe(true);
    });

    it("should reject empty phone", () => {
      const invalidData = {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "",
      };
      const result =
        emergencyContactSchema.safeParse(
          invalidData,
        );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues[0].message,
        ).toBe("Phone is required");
      }
    });
  });

  describe("relationship validation", () => {
    it("should accept valid relationship", () => {
      const validData = {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "123-456-7890",
      };
      const result =
        emergencyContactSchema.safeParse(
          validData,
        );
      expect(result.success).toBe(true);
    });

    it("should reject empty relationship", () => {
      const invalidData = {
        name: "Jane Doe",
        relationship: "",
        phone: "123-456-7890",
      };
      const result =
        emergencyContactSchema.safeParse(
          invalidData,
        );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues[0].message,
        ).toBe("Relationship is required");
      }
    });
  });

  describe("optional fields", () => {
    it("should accept optional sex field", () => {
      const validData = {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "123-456-7890",
        sex: "female",
      };
      const result =
        emergencyContactSchema.safeParse(
          validData,
        );
      expect(result.success).toBe(true);
    });

    it("should accept optional address field", () => {
      const validData = {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "123-456-7890",
        address: "123 Main St",
      };
      const result =
        emergencyContactSchema.safeParse(
          validData,
        );
      expect(result.success).toBe(true);
    });
  });
});

describe("Default Values", () => {
  it("should return correct default emergency contact", () => {
    expect(defaultEmergencyContact).toEqual({
      name: "",
      relationship: "",
      sex: "",
      phone: "",
      address: "",
    });
  });

  it("should return correct default child form data", () => {
    const defaultData = getDefaultChildFormData();
    expect(defaultData).toEqual({
      fullName: "",
      imageUri: "",
      gender: "",
      medicalNotes: "",
      emergencyContacts: [
        defaultEmergencyContact,
      ],
    });
  });

  it("default child form data should have correct structure", () => {
    const defaultData = getDefaultChildFormData();
    expect(defaultData.fullName).toBe("");
    expect(defaultData.imageUri).toBe("");
    expect(defaultData.gender).toBe("");
    expect(defaultData.medicalNotes).toBe("");
    expect(
      defaultData.emergencyContacts,
    ).toHaveLength(1);
  });
});
