import { motion } from "framer-motion";
import { useState } from "react";
import DeleteVaultConfirmModal from "../components/DeleteVaultConfirmModal";
import { deleteVault, openVault } from "../services/vaultService";
import { VaultContext, VaultSummary } from "../types";
import vaultIcon from "../assets/vault.svg";
import "../css/screens/WelcomeBackScreen.css";

interface WelcomeBackScreenProps {
  vaults: VaultSummary[];
  onUnlock: (vault: VaultContext) => void;
  onVaultDeleted: (path: string) => void;
}

export default function WelcomeBackScreen({
  vaults,
  onUnlock,
  onVaultDeleted,
}: WelcomeBackScreenProps) {
  const vault = vaults[0]; // Only one vault allowed
  const [masterPassword, setMasterPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vault || !masterPassword.trim()) {
      setError("Please enter your master password.");
      return;
    }

    setIsUnlocking(true);
    setError(null);

    try {
      const vaultData = await openVault({
        path: vault.path,
        masterPassword,
      });

      const vaultContext: VaultContext = {
        path: vault.path,
        data: vaultData,
        masterPassword,
      };

      setMasterPassword("");
      onUnlock(vaultContext);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to unlock vault";
      setError(message);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDeleteClick = () => {
    if (!vault || isUnlocking) {
      return;
    }
    setIsDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!vault || isDeleting) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteVault({ path: vault.path });
      setIsDeleteModalOpen(false);
      onVaultDeleted(vault.path);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to delete vault";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="welcome-back-container">
      <motion.img
        src={vaultIcon}
        alt="Vault"
        className="welcome-back-icon"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Welcome Back
      </motion.h1>
      <motion.p
        className="welcome-back-description"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Enter your Master Password to unlock and access your credentials.
      </motion.p>

      <motion.form
        className="welcome-back-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onSubmit={handleUnlock}
      >
        {vault && (
          <div className="selected-vault-preview">
            <span className="vault-name">{vault.vaultName}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="masterPassword">Master Password</label>
          <input
            type="password"
            id="masterPassword"
            value={masterPassword}
            onChange={(e) => {
              setMasterPassword(e.target.value);
              setError(null);
            }}
            disabled={isUnlocking}
            placeholder="Enter your master password"
            autoFocus
          />
        </div>

        {error && (
          <motion.div
            className="submit-feedback error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <motion.button
          type="submit"
          className="action-button submit-button"
          disabled={isUnlocking || !masterPassword.trim()}
          whileHover={
            !isUnlocking && masterPassword.trim()
              ? { scale: 1.02, backgroundColor: "#e5e5e5" }
              : {}
          }
          whileTap={
            !isUnlocking && masterPassword.trim() ? { scale: 0.98 } : {}
          }
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {isUnlocking ? (
            <span className="button-loading">
              <span className="spinner" aria-hidden="true" />
              Unlocking...
            </span>
          ) : (
            "Unlock Vault"
          )}
        </motion.button>
      </motion.form>

      <div className="welcome-back-actions">
        {deleteError && (
          <motion.div
            className="submit-feedback error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            {deleteError}
          </motion.div>
        )}
        <motion.button
          type="button"
          className="delete-vault-button"
          onClick={handleDeleteClick}
          disabled={!vault || isUnlocking || isDeleting}
          whileHover={
            !isDeleting && !isUnlocking && vault
              ? { scale: 1.02, backgroundColor: "#2a0000" }
              : {}
          }
          whileTap={
            !isDeleting && !isUnlocking && vault ? { scale: 0.98 } : {}
          }
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          Delete Vault
        </motion.button>
      </div>

      {vault && (
        <DeleteVaultConfirmModal
          isOpen={isDeleteModalOpen}
          vaultName={vault.vaultName}
          isDeleting={isDeleting}
          onClose={() => {
            if (!isDeleting) {
              setIsDeleteModalOpen(false);
              setDeleteError(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

