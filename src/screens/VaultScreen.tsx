import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import AddCredentialModal from "../components/AddCredentialModal";
import CreateFolderModal from "../components/CreateFolderModal";
import FolderPinModal from "../components/FolderPinModal";
import FolderSection from "../components/FolderSection";
import VaultSection from "../components/VaultSection";
import ViewCredentialModal from "../components/ViewCredentialModal";
import "../css/screens/VaultScreen.css";
import {
  addCredential,
  createFolder,
  deleteCredential,
  deleteFolder,
  exportVaultFile,
  verifyFolderPin,
} from "../services/vaultService";
import { VaultCredential, VaultData, VaultFolder } from "../types";

interface VaultScreenProps {
  vaultPath: string;
  vault: VaultData;
  masterPassword: string;
  onVaultUpdated: (data: VaultData) => void;
  onFolderOpen: (folder: VaultFolder) => void;
  activeFolder: VaultFolder | null;
  onFolderClose: () => void;
}

export default function VaultScreen({
  vault,
  vaultPath,
  masterPassword,
  onVaultUpdated,
  onFolderOpen,
  activeFolder,
  onFolderClose,
}: VaultScreenProps) {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<VaultFolder | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isCredentialSubmitting, setIsCredentialSubmitting] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [selectedCredential, setSelectedCredential] =
    useState<VaultCredential | null>(null);
  const [isViewCredentialOpen, setIsViewCredentialOpen] = useState(false);
  const [credentialDeletingId, setCredentialDeletingId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!activeFolder) {
      setIsCredentialModalOpen(false);
      setCredentialError(null);
      setIsCredentialSubmitting(false);
      setSelectedCredential(null);
      setIsViewCredentialOpen(false);
      setCredentialDeletingId(null);
    }
  }, [activeFolder]);

  useEffect(() => {
    if (!activeFolder || !selectedCredential) return;
    const updated = activeFolder.credentials.find(
      (cred) => cred.id === selectedCredential.id
    );
    if (!updated) {
      setSelectedCredential(null);
      setIsViewCredentialOpen(false);
    } else if (updated !== selectedCredential) {
      setSelectedCredential(updated);
    }
  }, [activeFolder, selectedCredential]);

  const { secureFoldersCount, totalCredentials } = useMemo(() => {
    const secureCount = vault.folders.filter((folder) => folder.secure).length;
    const credentials = vault.folders.reduce(
      (sum, folder) => sum + folder.credentials.length,
      0
    );
    return {
      secureFoldersCount: secureCount,
      totalCredentials: credentials,
    };
  }, [vault.folders]);

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

  const handleDeleteFolder = async (folderId: string) => {
    if (deletingFolderId === folderId) {
      return;
    }
    setDeletingFolderId(folderId);
    setDeleteError(null);
    try {
      const updatedVault = await deleteFolder({
        path: vaultPath,
        masterPassword,
        folderId,
      });
      onVaultUpdated(updatedVault);
      if (activeFolder && activeFolder.id === folderId) {
        onFolderClose();
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Unable to delete folder.";
      setDeleteError(message);
    } finally {
      setDeletingFolderId(null);
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

  const handleAddCredentialClick = () => {
    if (!activeFolder) return;
    setCredentialError(null);
    setIsCredentialModalOpen(true);
  };

  const handleCredentialSubmit = async ({
    identifier,
    username,
    password,
  }: {
    identifier: string;
    username: string;
    password: string;
  }) => {
    if (!activeFolder || isCredentialSubmitting) return;
    setIsCredentialSubmitting(true);
    setCredentialError(null);
    try {
      const updatedVault = await addCredential({
        path: vaultPath,
        masterPassword,
        folderId: activeFolder.id,
        identifier,
        username,
        password,
      });
      onVaultUpdated(updatedVault);
      setIsCredentialModalOpen(false);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Unable to save credential.";
      setCredentialError(message);
    } finally {
      setIsCredentialSubmitting(false);
    }
  };

  const handleCredentialDelete = async (credentialId: string) => {
    if (!activeFolder || credentialDeletingId === credentialId) return;
    setCredentialDeletingId(credentialId);
    setCredentialError(null);
    try {
      const updatedVault = await deleteCredential({
        path: vaultPath,
        masterPassword,
        folderId: activeFolder.id,
        credentialId,
      });
      onVaultUpdated(updatedVault);
      if (selectedCredential && selectedCredential.id === credentialId) {
        setSelectedCredential(null);
        setIsViewCredentialOpen(false);
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Unable to delete credential.";
      setCredentialError(message);
    } finally {
      setCredentialDeletingId(null);
    }
  };

  const handleCredentialSelect = (credential: VaultCredential) => {
    setSelectedCredential(credential);
    setIsViewCredentialOpen(true);
  };

  const handleExportVault = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportFeedback(null);
    try {
      const exported = await exportVaultFile(vaultPath);
      if (exported) {
        setExportFeedback({
          type: "success",
          message: "Vault exported successfully.",
        });
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Unable to export vault.";
      setExportFeedback({
        type: "error",
        message,
      });
    } finally {
      setIsExporting(false);
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
        <div className="vault-title-group">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {vault.vaultName}
          </motion.h1>
          <motion.button
            type="button"
            className="export-vault-button"
            onClick={handleExportVault}
            disabled={isExporting}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={!isExporting ? { scale: 1.02 } : {}}
            whileTap={!isExporting ? { scale: 0.98 } : {}}
          >
            {isExporting ? "Exporting..." : "Export Vault"}
          </motion.button>
        </div>
      </div>
      {exportFeedback && (
        <div
          className={`vault-export-feedback ${
            exportFeedback.type === "error" ? "error" : "success"
          }`}
        >
          {exportFeedback.message}
        </div>
      )}

      <div className="vault-overview">
        <div className="vault-summary-card">
          <span className="label">Folders</span>
          <span className="value">{vault.folders.length}</span>
        </div>
        <div className="vault-summary-card">
          <span className="label">Secure Folders</span>
          <span className="value">{secureFoldersCount}</span>
        </div>
        <div className="vault-summary-card">
          <span className="label">Credentials</span>
          <span className="value">{totalCredentials}</span>
        </div>
      </div>

      {activeFolder ? (
        <FolderSection
          folder={activeFolder}
          onAddCredential={handleAddCredentialClick}
          onBack={() => {
            setIsCredentialModalOpen(false);
            setCredentialError(null);
            setIsViewCredentialOpen(false);
            setSelectedCredential(null);
            onFolderClose();
          }}
          isAddDisabled={isCredentialSubmitting}
          credentialError={credentialError}
          onCredentialSelect={handleCredentialSelect}
          onCredentialDelete={handleCredentialDelete}
          deletingCredentialId={credentialDeletingId}
        />
      ) : (
        <VaultSection
          folders={vault.folders}
          onCreateFolder={() => setCreateModalOpen(true)}
          onFolderClick={handleFolderClick}
          onDeleteFolder={handleDeleteFolder}
          deletingFolderId={deletingFolderId}
          isSubmitting={isSubmitting}
          error={error}
          deleteError={deleteError}
        />
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

      {activeFolder && (
        <AddCredentialModal
          isOpen={isCredentialModalOpen}
          isSubmitting={isCredentialSubmitting}
          onClose={() => {
            if (!isCredentialSubmitting) {
              setIsCredentialModalOpen(false);
              setCredentialError(null);
            }
          }}
          onSubmit={handleCredentialSubmit}
        />
      )}

      {selectedCredential && (
        <ViewCredentialModal
          isOpen={isViewCredentialOpen}
          identifier={selectedCredential.title}
          username={selectedCredential.username}
          password={selectedCredential.password}
          onClose={() => setIsViewCredentialOpen(false)}
        />
      )}
    </motion.section>
  );
}
