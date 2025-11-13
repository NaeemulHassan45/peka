use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use argon2::password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::{Algorithm, Argon2, Params, Version};
use base64::{engine::general_purpose, Engine as _};
use chrono::Utc;
use directories::ProjectDirs;
use rand::rngs::OsRng;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

const DEFAULT_MEMORY_KIB: u32 = 131_072;
const DEFAULT_TIME_COST: u32 = 3;
const DEFAULT_PARALLELISM: u32 = 2;
const DEFAULT_HASH_LENGTH: u32 = 32;
const DEFAULT_SALT_LENGTH: usize = 16;
const CURRENT_VERSION: u8 = 1;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize, Deserialize, Clone)]
struct KdfParams {
    algorithm: String,
    memory_kib: u32,
    time_cost: u32,
    parallelism: u32,
    hash_length: u32,
    salt_length: u32,
}

#[derive(Serialize, Deserialize, Clone)]
struct VaultFile {
    version: u8,
    vault_name: String,
    kdf: KdfParams,
    salt: String,
    nonce: String,
    ciphertext: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CreateVaultResult {
    path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VaultSummary {
    path: String,
    vault_name: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct StoredCredential {
    id: String,
    title: String,
    username: String,
    password: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    notes: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct StoredFolder {
    id: String,
    name: String,
    secure: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pin_hash: Option<String>,
    credentials: Vec<StoredCredential>,
    created_at: String,
    updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct StoredVault {
    vault_name: String,
    folders: Vec<StoredFolder>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VaultCredential {
    id: String,
    title: String,
    username: String,
    password: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    notes: Option<String>,
    #[serde(rename = "createdAt")]
    created_at: String,
    #[serde(rename = "updatedAt")]
    updated_at: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VaultFolderPublic {
    id: String,
    name: String,
    secure: bool,
    credentials: Vec<VaultCredential>,
    #[serde(rename = "createdAt")]
    created_at: String,
    #[serde(rename = "updatedAt")]
    updated_at: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VaultContents {
    vault_name: String,
    folders: Vec<VaultFolderPublic>,
}

#[tauri::command]
#[allow(non_snake_case)]
async fn create_vault(vaultName: String, masterPassword: String) -> Result<CreateVaultResult, String> {
    tauri::async_runtime::spawn_blocking(move || create_vault_inner(vaultName, masterPassword))
        .await
        .map_err(|e| e.to_string())?
}

fn create_vault_inner(vault_name: String, master_password: String) -> Result<CreateVaultResult, String> {
    let trimmed_vault_name = vault_name.trim();
    if trimmed_vault_name.is_empty() {
        return Err("Vault name cannot be empty".to_string());
    }

    if master_password.trim().is_empty() {
        return Err("Master password cannot be empty".to_string());
    }

    let payload = StoredVault {
        vault_name: trimmed_vault_name.to_string(),
        folders: Vec::new(),
    };

    let vault_file = encrypt_payload(&payload, &master_password, None)?;
    let vault_json = serde_json::to_string_pretty(&vault_file).map_err(|e| e.to_string())?;

    let base_dir = resolve_vault_directory()?;
    fs::create_dir_all(&base_dir).map_err(|e| e.to_string())?;

    let file_name = format!("{}.peka", sanitize_file_name(trimmed_vault_name));
    let file_path = base_dir.join(file_name);

    fs::write(&file_path, vault_json).map_err(|e| e.to_string())?;

    Ok(CreateVaultResult {
        path: file_path.to_string_lossy().to_string(),
    })
}

#[tauri::command]
#[allow(non_snake_case)]
async fn open_vault(path: String, masterPassword: String) -> Result<VaultContents, String> {
    tauri::async_runtime::spawn_blocking(move || open_vault_inner(&path, &masterPassword))
        .await
        .map_err(|e| e.to_string())?
}

fn open_vault_inner(path: &str, master_password: &str) -> Result<VaultContents, String> {
    let (_vault_file, payload) = decrypt_vault(path, master_password)?;
    Ok(payload_to_public(&payload))
}

#[tauri::command]
#[allow(non_snake_case)]
async fn create_folder(
    path: String,
    masterPassword: String,
    name: String,
    secure: bool,
    pin: Option<String>,
) -> Result<VaultContents, String> {
    tauri::async_runtime::spawn_blocking(move || {
        create_folder_inner(&path, &masterPassword, name, secure, pin)
    })
    .await
    .map_err(|e| e.to_string())?
}

fn create_folder_inner(
    path: &str,
    master_password: &str,
    name: String,
    secure: bool,
    pin: Option<String>,
) -> Result<VaultContents, String> {
    let folder_name = name.trim();
    if folder_name.is_empty() {
        return Err("Folder name is required.".to_string());
    }

    if secure {
        let pin_ref = pin.as_deref().ok_or_else(|| "PIN is required for secure folders.".to_string())?;
        if !pin_ref.chars().all(|c| c.is_ascii_digit()) || pin_ref.len() != 4 {
            return Err("PIN must be exactly 4 digits.".to_string());
        }
    }

    let (vault_file, mut payload) = decrypt_vault(path, master_password)?;

    let now = Utc::now().to_rfc3339();
    let stored_folder = StoredFolder {
        id: Uuid::new_v4().to_string(),
        name: folder_name.to_string(),
        secure,
        pin_hash: if secure {
            let pin_value = pin.unwrap();
            let salt = SaltString::generate(&mut OsRng);
            let argon = Argon2::default();
            Some(
                argon
                    .hash_password(pin_value.as_bytes(), &salt)
                    .map_err(|e| e.to_string())?
                    .to_string(),
            )
        } else {
            None
        },
        credentials: Vec::new(),
        created_at: now.clone(),
        updated_at: now.clone(),
    };

    payload.folders.push(stored_folder);

    let updated_file = encrypt_payload(&payload, master_password, Some(&vault_file.kdf))?;
    let vault_json = serde_json::to_string_pretty(&updated_file).map_err(|e| e.to_string())?;
    fs::write(path, vault_json).map_err(|e| e.to_string())?;

    Ok(payload_to_public(&payload))
}

fn encrypt_payload(
    payload: &StoredVault,
    master_password: &str,
    existing_kdf: Option<&KdfParams>,
) -> Result<VaultFile, String> {
    let (memory_kib, time_cost, parallelism, hash_length, salt_length) = if let Some(kdf) = existing_kdf {
        (
            kdf.memory_kib,
            kdf.time_cost,
            kdf.parallelism,
            kdf.hash_length,
            kdf.salt_length as usize,
        )
    } else {
        (
            DEFAULT_MEMORY_KIB,
            DEFAULT_TIME_COST,
            DEFAULT_PARALLELISM,
            DEFAULT_HASH_LENGTH,
            DEFAULT_SALT_LENGTH,
        )
    };

    let params = Params::new(
        memory_kib,
        time_cost,
        parallelism,
        Some(hash_length as usize),
    )
    .map_err(|e| e.to_string())?;

    let mut salt = vec![0u8; salt_length];
    OsRng.fill_bytes(&mut salt);

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut encryption_key = vec![0u8; hash_length as usize];
    argon2
        .hash_password_into(master_password.as_bytes(), &salt, &mut encryption_key)
        .map_err(|e| e.to_string())?;

    let clear_bytes = serde_json::to_vec(payload).map_err(|e| e.to_string())?;

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);

    let cipher = Aes256Gcm::new_from_slice(&encryption_key).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, clear_bytes.as_ref())
        .map_err(|e| e.to_string())?;

    Ok(VaultFile {
        version: CURRENT_VERSION,
        vault_name: payload.vault_name.clone(),
        kdf: KdfParams {
            algorithm: "Argon2id".to_string(),
            memory_kib,
            time_cost,
            parallelism,
            hash_length,
            salt_length: salt_length as u32,
        },
        salt: general_purpose::STANDARD.encode(salt),
        nonce: general_purpose::STANDARD.encode(nonce_bytes),
        ciphertext: general_purpose::STANDARD.encode(ciphertext),
    })
}

fn decrypt_vault(path: &str, master_password: &str) -> Result<(VaultFile, StoredVault), String> {
    let raw =
        fs::read_to_string(path).map_err(|_| "Unable to read vault file from disk".to_string())?;
    let vault_file: VaultFile =
        serde_json::from_str(&raw).map_err(|_| "Vault file is corrupted or invalid".to_string())?;

    let salt = general_purpose::STANDARD
        .decode(vault_file.salt.clone())
        .map_err(|_| "Invalid salt encoding".to_string())?;
    let nonce_bytes = general_purpose::STANDARD
        .decode(vault_file.nonce.clone())
        .map_err(|_| "Invalid nonce encoding".to_string())?;
    let ciphertext = general_purpose::STANDARD
        .decode(vault_file.ciphertext.clone())
        .map_err(|_| "Invalid ciphertext encoding".to_string())?;

    let params = Params::new(
        vault_file.kdf.memory_kib,
        vault_file.kdf.time_cost,
        vault_file.kdf.parallelism,
        Some(vault_file.kdf.hash_length as usize),
    )
    .map_err(|e| e.to_string())?;

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut encryption_key = vec![0u8; vault_file.kdf.hash_length as usize];
    argon2
        .hash_password_into(master_password.as_bytes(), &salt, &mut encryption_key)
        .map_err(|_| "Unable to derive encryption key".to_string())?;

    let cipher = Aes256Gcm::new_from_slice(&encryption_key).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(&nonce_bytes);
    let decrypted = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|_| "Failed to decrypt vault: incorrect password or corrupted data".to_string())?;

    let payload: StoredVault =
        serde_json::from_slice(&decrypted).map_err(|_| "Vault data is malformed".to_string())?;

    Ok((vault_file, payload))
}

fn payload_to_public(payload: &StoredVault) -> VaultContents {
    let folders = payload
        .folders
        .iter()
        .map(|folder| VaultFolderPublic {
            id: folder.id.clone(),
            name: folder.name.clone(),
            secure: folder.secure,
            credentials: folder
                .credentials
                .iter()
                .map(|cred| VaultCredential {
                    id: cred.id.clone(),
                    title: cred.title.clone(),
                    username: cred.username.clone(),
                    password: cred.password.clone(),
                    notes: cred.notes.clone(),
                    created_at: cred.created_at.clone(),
                    updated_at: cred.updated_at.clone(),
                })
                .collect(),
            created_at: folder.created_at.clone(),
            updated_at: folder.updated_at.clone(),
        })
        .collect();

    VaultContents {
        vault_name: payload.vault_name.clone(),
        folders,
    }
}

fn resolve_vault_directory() -> Result<PathBuf, String> {
    if let Some(proj_dirs) = ProjectDirs::from("com", "nalsan", "peka") {
        return Ok(proj_dirs.data_dir().join("vaults"));
    }
    let mut dir = std::env::current_dir().map_err(|e| e.to_string())?;
    dir.push("vaults");
    Ok(dir)
}

fn sanitize_file_name(input: &str) -> String {
    let sanitized: String = input
        .trim()
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else if ch.is_whitespace() {
                '_'
            } else {
                '_'
            }
        })
        .collect();

    let trimmed = sanitized.trim_matches('_');

    if trimmed.is_empty() {
        "vault".to_string()
    } else {
        trimmed.replace("__", "_")
    }
}

#[tauri::command]
async fn list_vaults() -> Result<Vec<VaultSummary>, String> {
    tauri::async_runtime::spawn_blocking(list_vaults_inner)
        .await
        .map_err(|e| e.to_string())?
}

fn list_vaults_inner() -> Result<Vec<VaultSummary>, String> {
    let base_dir = resolve_vault_directory()?;
    if !base_dir.exists() {
        return Ok(Vec::new());
    }

    let mut summaries = Vec::new();
    for entry in fs::read_dir(base_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        if path.extension().and_then(|ext| ext.to_str()) != Some("peka") {
            continue;
        }

        match fs::read_to_string(&path) {
            Ok(raw) => match serde_json::from_str::<VaultFile>(&raw) {
                Ok(vault_file) => summaries.push(VaultSummary {
                    path: path.to_string_lossy().to_string(),
                    vault_name: vault_file.vault_name,
                }),
                Err(_) => {
                    // Skip corrupted entries silently
                    continue;
                }
            },
            Err(_) => continue,
        }
    }

    Ok(summaries)
}

#[tauri::command]
#[allow(non_snake_case)]
async fn verify_folder_pin(
    vaultPath: String,
    masterPassword: String,
    folderId: String,
    pin: String,
) -> Result<bool, String> {
    tauri::async_runtime::spawn_blocking(move || {
        verify_folder_pin_inner(&vaultPath, &masterPassword, &folderId, &pin)
    })
    .await
    .map_err(|e| e.to_string())?
}

fn verify_folder_pin_inner(
    vault_path: &str,
    master_password: &str,
    folder_id: &str,
    pin: &str,
) -> Result<bool, String> {
    let (_vault_file, payload) = decrypt_vault(vault_path, master_password)?;

    let folder = payload
        .folders
        .iter()
        .find(|f| f.id == folder_id)
        .ok_or_else(|| "Folder not found".to_string())?;

    if !folder.secure {
        return Ok(true); // Non-secure folders don't need PIN
    }

    let pin_hash = folder
        .pin_hash
        .as_ref()
        .ok_or_else(|| "Folder PIN hash not found".to_string())?;

    let parsed_hash = PasswordHash::new(pin_hash).map_err(|e| e.to_string())?;
    let argon2 = Argon2::default();

    match argon2.verify_password(pin.as_bytes(), &parsed_hash) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            create_vault,
            open_vault,
            create_folder,
            list_vaults,
            verify_folder_pin
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
