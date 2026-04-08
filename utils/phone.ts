export const PHONE_FORMAT_REGEX = /^\(\d{3}\) \d{3}-\d{4}$/;

const PHONE_DIGIT_LIMIT = 10;

const getDigits = (value?: string | null) =>
  (value ?? "").replace(/\D/g, "").slice(0, PHONE_DIGIT_LIMIT);

export const formatPhoneNumber = (value?: string | null) => {
  const digits = getDigits(value);

  if (!digits) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const formatPhoneForDisplay = (value?: string | null) => {
  if (!value) return value;

  const digits = getDigits(value);
  if (digits.length !== PHONE_DIGIT_LIMIT) return value;

  return formatPhoneNumber(digits);
};
