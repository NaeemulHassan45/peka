import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import {
  AddCredentialPayload,
  CreateFolderPayload,
  CreateVaultPayload,
  CreateVaultResponse,
  DeleteCredentialPayload,
  DeleteFolderPayload,
  DeleteVaultPayload,
  OpenVaultPayload,
  VaultData,
  VaultSummary,
  VerifyFolderPinPayload,
} from "../types";

export async function createVault({
  vaultName,
  masterPassword,
}: CreateVaultPayload): Promise<CreateVaultResponse> {
  return invoke<CreateVaultResponse>("create_vault", {
    vaultName,
    masterPassword,
  });
}

export async function openVault({
  path,
  masterPassword,
}: OpenVaultPayload): Promise<VaultData> {
  return invoke<VaultData>("open_vault", {
    path,
    masterPassword,
  });
}

export async function createFolder({
  path,
  masterPassword,
  name,
  secure,
  pin,
}: CreateFolderPayload): Promise<VaultData> {
  return invoke<VaultData>("create_folder", {
    path,
    masterPassword,
    name,
    secure,
    pin,
  });
}

export async function listVaults(): Promise<VaultSummary[]> {
  return invoke<VaultSummary[]>("list_vaults");
}

export async function verifyFolderPin({
  vaultPath,
  masterPassword,
  folderId,
  pin,
}: VerifyFolderPinPayload): Promise<boolean> {
  return invoke<boolean>("verify_folder_pin", {
    vaultPath,
    masterPassword,
    folderId,
    pin,
  });
}

export async function deleteVault({ path }: DeleteVaultPayload): Promise<void> {
  return invoke<void>("delete_vault", { path });
}

export async function exportVaultFile(path: string): Promise<boolean> {
  const destination = await save({
    defaultPath: path,
    filters: [
      {
        name: "PEKA Vault",
        extensions: ["peka"],
      },
    ],
  });

  if (!destination) {
    return false;
  }

  await invoke<void>("export_vault_file", {
    sourcePath: path,
    destinationPath: destination,
  });
  return true;
}

export async function deleteFolder({
  path,
  masterPassword,
  folderId,
}: DeleteFolderPayload): Promise<VaultData> {
  return invoke<VaultData>("delete_folder", {
    path,
    masterPassword,
    folderId,
  });
}

export async function addCredential({
  path,
  masterPassword,
  folderId,
  identifier,
  username,
  password,
}: AddCredentialPayload): Promise<VaultData> {
  return invoke<VaultData>("add_credential", {
    path,
    masterPassword,
    folderId,
    identifier,
    username,
    password,
  });
}

export async function deleteCredential({
  path,
  masterPassword,
  folderId,
  credentialId,
}: DeleteCredentialPayload): Promise<VaultData> {
  return invoke<VaultData>("delete_credential", {
    path,
    masterPassword,
    folderId,
    credentialId,
  });
}
