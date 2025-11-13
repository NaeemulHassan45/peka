import { motion } from "framer-motion";
import { useState } from "react";
import "../css/screens/MasterPasswordSetupScreen.css";
import { createVault, openVault } from "../services/vaultService";
import { ValidationResult, VaultContext, VaultData } from "../types";
import { validatePassword } from "../utils/passwordValidation";

interface MasterPasswordSetupScreenProps {
  onVaultCreated: (vault: VaultContext) => void;
  onBack: () => void;
}

export default function MasterPasswordSetupScreen({
  onVaultCreated,
  onBack,
}: MasterPasswordSetupScreenProps) {
  const [vaultName, setVaultName] = useState("");
  const [vaultNameError, setVaultNameError] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdVault, setCreatedVault] = useState<VaultContext | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleVaultNameChange = (value: string) => {
    setVaultName(value);
    if (value.trim().length === 0) {
      setVaultNameError("Vault name is required");
    } else {
      setVaultNameError("");
    }
  };

  const handlePasswordChange = (value: string, isConfirm: boolean) => {
    if (isConfirm) {
      setConfirmPassword(value);
      if (masterPassword || value) {
        setValidation(validatePassword(masterPassword, value));
      } else {
        setValidation({ isValid: false, errors: [] });
      }
    } else {
      setMasterPassword(value);
      if (confirmPassword || value) {
        setValidation(validatePassword(value, confirmPassword));
      } else {
        setValidation({ isValid: false, errors: [] });
      }
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

    const result = validatePassword(masterPassword, confirmPassword);
    setValidation(result);
    if (result.isValid) {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const { path } = await createVault({
          vaultName: vaultName.trim(),
          masterPassword,
        });

        const vaultData: VaultData = await openVault({
          path,
          masterPassword,
        });

        const vaultContext: VaultContext = {
          path,
          data: vaultData,
          masterPassword,
        };

        setCreatedVault(vaultContext);
        setShowSuccessModal(true);

        // Clear sensitive fields once we've opened the vault
        setMasterPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error(error);
        setCreatedVault(null);
        const message =
          error instanceof Error
            ? error.message
            : String(error ?? "Unknown error");
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="password-setup-container">
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
        Set Your Master Password
      </motion.h1>
      <motion.p
        className="description"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Choose a strong, memorable password. This key will be used to encrypt
        and unlock your entire vault. There is no recovery if you forget it.
      </motion.p>

      <motion.form
        className="password-form"
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
          />
          {vaultNameError && (
            <span className="field-error">{vaultNameError}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="masterPassword">Master Password</label>
          <input
            type="password"
            id="masterPassword"
            value={masterPassword}
            onChange={(e) => handlePasswordChange(e.target.value, false)}
            className={
              validation.errors.length > 0 && masterPassword
                ? "input-error"
                : ""
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => handlePasswordChange(e.target.value, true)}
            className={
              validation.errors.length > 0 && confirmPassword
                ? "input-error"
                : ""
            }
            disabled={isSubmitting}
          />
        </div>

        {validation.errors.length > 0 && (
          <motion.div
            className="validation-errors"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <ul>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.button
          type="submit"
          className={`action-button submit-button${
            isSubmitting ? " loading" : ""
          }`}
          disabled={
            !validation.isValid || vaultName.trim().length === 0 || isSubmitting
          }
          whileHover={
            validation.isValid && vaultName.trim().length > 0 && !isSubmitting
              ? { scale: 1.05, backgroundColor: "#e5e5e5" }
              : {}
          }
          whileTap={
            validation.isValid && vaultName.trim().length > 0 && !isSubmitting
              ? { scale: 0.98 }
              : {}
          }
          transition={{ duration: 0.2 }}
        >
          {isSubmitting ? (
            <span className="button-loading">
              <span className="spinner" aria-hidden="true" />
              Encrypting Vault...
            </span>
          ) : (
            "Create and Secure Vault"
          )}
        </motion.button>
        {submitError && (
          <div className="submit-feedback error">{submitError}</div>
        )}
      </motion.form>

      {showSuccessModal && createdVault && (
        <div className="modal-backdrop">
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vault-success-title"
          >
            <h2 id="vault-success-title">Vault Created Successfully</h2>
            <p className="modal-description">
              Your vault has been encrypted and stored securely. Remember: if
              you forget your Master Password, all encrypted data will be lost
              permanently. There is no recovery mechanism.
            </p>
            <div className="modal-vault-summary">
              <span className="label">Vault Name</span>
              <span className="value">{createdVault.data.vaultName}</span>
            </div>
            <div className="modal-actions">
              <motion.button
                className="action-button"
                whileHover={{ scale: 1.05, backgroundColor: "#e5e5e5" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowSuccessModal(false);
                  const vault = createdVault;
                  setCreatedVault(null);
                  if (vault) {
                    onVaultCreated(vault);
                  }
                }}
              >
                Enter Vault
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
