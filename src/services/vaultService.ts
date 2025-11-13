import { invoke } from "@tauri-apps/api/core";
import {
  CreateFolderPayload,
  CreateVaultPayload,
  CreateVaultResponse,
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
