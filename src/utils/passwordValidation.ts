import zxcvbn from "zxcvbn";
import { ValidationResult } from "../types";

export const validatePassword = (
  password: string,
  confirm: string
): ValidationResult => {
  const errors: string[] = [];

  // 1. Non-Empty
  if (!password || password.trim() === "") {
    errors.push("Password cannot be empty");
    return { isValid: false, errors };
  }

  // 2. Minimum Length
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  // 3. Mixed Case
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    errors.push("Password must include both uppercase and lowercase letters");
  }

  // 4. Numeric Inclusion
  if (!/[0-9]/.test(password)) {
    errors.push("Password must include at least one digit (0-9)");
  }

  // 5. Symbol Inclusion
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must include at least one special character");
  }

  // 6. Match Check
  if (password !== confirm) {
    errors.push("Passwords do not match");
  }

  // 7. Password Entropy Score (using zxcvbn)
  const zxcvbnResult = zxcvbn(password);
  if (zxcvbnResult.score < 3) {
    errors.push("Password is too weak. Please use a stronger password");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

