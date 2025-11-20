import { open } from "@tauri-apps/plugin-dialog";
import { motion } from "framer-motion";
import { useState } from "react";
import "../css/screens/ImportVaultScreen.css";
import { importVault, openVault } from "../services/vaultService";
import { VaultContext } from "../types";

interface ImportVaultScreenProps {
  onVaultImported: (vault: VaultContext) => void;
  onBack: () => void;
}

export default function ImportVaultScreen({
  onVaultImported,
  onBack,
}: ImportVaultScreenProps) {
  const [vaultName, setVaultName] = useState("");
  const [vaultNameError, setVaultNameError] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleVaultNameChange = (value: string) => {
    setVaultName(value);
    if (value.trim().length === 0) {
      setVaultNameError("Vault name is required");
    } else {
      setVaultNameError("");
    }
  };

  const handleFileSelect = async () => {
    setFileError(null);
    setSubmitError(null);

    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "PEKA Vault",
            extensions: ["peka"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        setSelectedFilePath(selected);
        const fileName = selected.split(/[/\\]/).pop() || "vault.peka";
        setSelectedFileName(fileName);
      }
    } catch (error) {
      console.error("File selection error:", error);
      setFileError("Failed to select file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (vaultName.trim().length === 0) {
      setVaultNameError("Vault name is required");
      return;
    }
    setVaultNameError("");

    if (!selectedFilePath) {
      setFileError("Please select a vault file");
      return;
    }
    setFileError("");

    if (!masterPassword.trim()) {
      setSubmitError("Master password is required");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { path } = await importVault({
        sourcePath: selectedFilePath,
        vaultName: vaultName.trim(),
        masterPassword,
      });

      const vaultData = await openVault({
        path,
        masterPassword,
      });

      const vaultContext: VaultContext = {
        path,
        data: vaultData,
        masterPassword,
      };

      setMasterPassword("");
      setVaultName("");
      setSelectedFilePath(null);
      setSelectedFileName(null);
      onVaultImported(vaultContext);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : String(error ?? "Unknown error");
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="import-vault-container">
      <motion.button
        className="back-button"
        onClick={onBack}
        disabled={isSubmitting}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back
      </motion.button>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Import Existing Vault
      </motion.h1>
      <motion.p
        className="description"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Select your vault file and enter your Master Password to import and
        access your credentials on this device.
      </motion.p>

      <motion.form
        className="import-vault-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="vaultName">Vault Name</label>
          <input
            type="text"
            id="vaultName"
            value={vaultName}
            onChange={(e) => handleVaultNameChange(e.target.value)}
            className={vaultNameError ? "input-error" : ""}
            disabled={isSubmitting}
            placeholder="e.g. My Personal Vault"
          />
          {vaultNameError && (
            <span className="field-error">{vaultNameError}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="vaultFile">Vault File</label>
          <button
            type="button"
            className="file-select-button"
            onClick={handleFileSelect}
            disabled={isSubmitting}
          >
            {selectedFileName ? `Selected: ${selectedFileName}` : "Choose Vault File"}
          </button>
          {fileError && <span className="field-error">{fileError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="masterPassword">Master Password</label>
          <input
            type="password"
            id="masterPassword"
            value={masterPassword}
            onChange={(e) => {
              setMasterPassword(e.target.value);
              setSubmitError(null);
            }}
            disabled={isSubmitting}
            placeholder="Enter your master password"
          />
        </div>

        {submitError && (
          <motion.div
            className="submit-feedback error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            {submitError}
          </motion.div>
        )}

        <motion.button
          type="submit"
          className={`action-button submit-button${
            isSubmitting ? " loading" : ""
          }`}
          disabled={
            !vaultName.trim() ||
            !selectedFilePath ||
            !masterPassword.trim() ||
            isSubmitting
          }
          whileHover={
            vaultName.trim() &&
            selectedFilePath &&
            masterPassword.trim() &&
            !isSubmitting
              ? { scale: 1.05, backgroundColor: "#e5e5e5" }
              : {}
          }
          whileTap={
            vaultName.trim() &&
            selectedFilePath &&
            masterPassword.trim() &&
            !isSubmitting
              ? { scale: 0.98 }
              : {}
          }
          transition={{ duration: 0.2 }}
        >
          {isSubmitting ? (
            <span className="button-loading">
              <span className="spinner" aria-hidden="true" />
              Importing Vault...
            </span>
          ) : (
            "Import Vault"
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}

