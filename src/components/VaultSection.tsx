import { motion } from "framer-motion";
import folderIcon from "../assets/folder.svg";
import plusIcon from "../assets/plus.svg";
import VaultFolderCard from "./VaultFolderCard";
import { VaultFolder } from "../types";

interface VaultSectionProps {
  folders: VaultFolder[];
  onCreateFolder: () => void;
  onFolderClick: (folder: VaultFolder) => void;
  onDeleteFolder: (folderId: string) => void;
  deletingFolderId: string | null;
  isSubmitting: boolean;
  error?: string | null;
  deleteError?: string | null;
}

export default function VaultSection({
  folders,
  onCreateFolder,
  onFolderClick,
  onDeleteFolder,
  deletingFolderId,
  isSubmitting,
  error,
  deleteError,
}: VaultSectionProps) {
  return (
    <section className="vault-section">
      <div className="vault-section-heading">
        <div>
          <p className="section-label">Folders</p>
          <h2>Organize your vault</h2>
        </div>
        <motion.button
          className="create-folder-button"
          onClick={onCreateFolder}
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
      {deleteError && (
        <motion.div
          className="vault-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {deleteError}
        </motion.div>
      )}

      {folders.length === 0 ? (
        <div className="vault-empty-state">
          <img src={folderIcon} alt="" className="empty-state-icon" />
          <h2>No folders yet</h2>
          <p>Create your first folder to start organizing your credentials</p>
        </div>
      ) : (
        <div className="vault-folders-grid">
          {folders.map((folder) => (
            <VaultFolderCard
              key={folder.id}
              folder={folder}
              onClick={onFolderClick}
              onDelete={onDeleteFolder}
              isDeleting={deletingFolderId === folder.id}
              disableActions={isSubmitting}
            />
          ))}
        </div>
      )}
    </section>
  );
}

