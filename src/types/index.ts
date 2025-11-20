export type Screen =
  | "welcome"
  | "welcomeBack"
  | "masterPasswordSetup"
  | "vault";

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

export interface DeleteVaultPayload {
  path: string;
}

export interface DeleteFolderPayload {
  path: string;
  masterPassword: string;
  folderId: string;
}

export interface DeleteCredentialPayload {
  path: string;
  masterPassword: string;
  folderId: string;
  credentialId: string;
}

export interface AddCredentialPayload {
  path: string;
  masterPassword: string;
  folderId: string;
  identifier: string;
  username: string;
  password: string;
}
