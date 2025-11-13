export type Screen =
  | "welcome"
  | "welcomeBack"
  | "masterPasswordSetup"
  | "vault"
  | "folder";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CreateVaultPayload {
  vaultName: string;
  masterPassword: string;
}

export interface CreateVaultResponse {
  path: string;
}

export interface VaultContext {
  path: string;
  data: VaultData;
  masterPassword: string;
}

export interface VaultData {
  vaultName: string;
  folders: VaultFolder[];
}

export interface VaultFolder {
  id: string;
  name: string;
  secure: boolean;
  credentials: VaultCredential[];
  createdAt: string;
  updatedAt: string;
}

export interface VaultCredential {
  id: string;
  title: string;
  username: string;
  password: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpenVaultPayload {
  path: string;
  masterPassword: string;
}

export interface CreateFolderPayload {
  path: string;
  masterPassword: string;
  name: string;
  secure: boolean;
  pin?: string;
}

export interface VaultSummary {
  path: string;
  vaultName: string;
}

export interface VerifyFolderPinPayload {
  vaultPath: string;
  masterPassword: string;
  folderId: string;
  pin: string;
}
