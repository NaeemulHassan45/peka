import { motion } from "framer-motion";
import { useState } from "react";
import folderIcon from "../assets/folder.svg";
import plusIcon from "../assets/plus.svg";
import shieldIcon from "../assets/sheild.svg";
import CreateFolderModal from "../components/CreateFolderModal";
import FolderPinModal from "../components/FolderPinModal";
import "../css/screens/VaultScreen.css";
import { createFolder, verifyFolderPin } from "../services/vaultService";
import { VaultData, VaultFolder } from "../types";

interface VaultScreenProps {
  vaultPath: string;
  vault: VaultData;
  masterPassword: string;
  onVaultUpdated: (data: VaultData) => void;
  onFolderOpen: (folder: VaultFolder) => void;
}

export default function VaultScreen({
  vault,
  vaultPath,
  masterPassword,
  onVaultUpdated,
  onFolderOpen,
}: VaultScreenProps) {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<VaultFolder | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFolder = async ({
    name,
    secure,
    pin,
  }: {
    name: string;
    secure: boolean;
    pin?: string;
  }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedVault = await createFolder({
        path: vaultPath,
        masterPassword,
        name,
        secure,
        pin,
      });
      onVaultUpdated(updatedVault);
      setCreateModalOpen(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create folder. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFolderClick = (folder: VaultFolder) => {
    if (folder.secure) {
      setSelectedFolder(folder);
      setIsPinModalOpen(true);
    } else {
      onFolderOpen(folder);
    }
  };

  const handlePinVerify = async (pin: string): Promise<boolean> => {
    if (!selectedFolder) return false;
    try {
      const isValid = await verifyFolderPin({
        vaultPath,
        masterPassword,
        folderId: selectedFolder.id,
        pin,
      });
      return isValid;
    } catch (err) {
      console.error("PIN verification error:", err);
      return false;
    }
  };

  const handlePinSuccess = () => {
    if (selectedFolder) {
      setIsPinModalOpen(false);
      onFolderOpen(selectedFolder);
      setSelectedFolder(null);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="vault-screen"
    >
      <div className="vault-screen-header">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {vault.vaultName}
        </motion.h1>
        <motion.button
          className="create-folder-button"
          onClick={() => setCreateModalOpen(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img src={plusIcon} alt="" />
          Create Folder
        </motion.button>
      </div>

      {error && (
        <motion.div
          className="vault-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {vault.folders.length === 0 ? (
        <div className="vault-empty-state">
          <img src={folderIcon} alt="" className="empty-state-icon" />
          <h2>No folders yet</h2>
          <p>Create your first folder to start organizing your credentials</p>
          <motion.button
            className="action-button"
            onClick={() => setCreateModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Your First Folder
          </motion.button>
        </div>
      ) : (
        <div className="vault-folders-grid">
          {vault.folders.map((folder) => (
            <article
              key={folder.id}
              className="vault-folder-card"
              onClick={() => handleFolderClick(folder)}
            >
              {folder.secure && (
                <span className="folder-secure-badge">
                  <img src={shieldIcon} alt="Secure" aria-hidden="true" />
                </span>
              )}
              <img
                src={folderIcon}
                alt=""
                className="folder-icon"
                draggable={false}
              />
              <h3 className="folder-title">{folder.name}</h3>
              <p className="folder-hint">
                {folder.credentials.length} credential
                {folder.credentials.length === 1 ? "" : "s"}
              </p>
            </article>
          ))}
        </div>
      )}

      <CreateFolderModal
        isOpen={isCreateModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setCreateModalOpen(false);
            setError(null);
          }
        }}
        onCreate={handleCreateFolder}
      />

      {selectedFolder && (
        <FolderPinModal
          isOpen={isPinModalOpen}
          folderName={selectedFolder.name}
          onClose={() => {
            setIsPinModalOpen(false);
            setSelectedFolder(null);
          }}
          onVerify={handlePinVerify}
          onSuccess={handlePinSuccess}
        />
      )}
    </motion.section>
  );
}
