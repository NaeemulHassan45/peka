import { motion } from "framer-motion";
import plusIcon from "../assets/plus.svg";
import { VaultCredential, VaultFolder } from "../types";

interface FolderSectionProps {
  folder: VaultFolder;
  onAddCredential: () => void;
  onBack?: () => void;
  isAddDisabled?: boolean;
  credentialError?: string | null;
  onCredentialSelect: (credential: VaultCredential) => void;
  onCredentialDelete: (credentialId: string) => void;
  deletingCredentialId: string | null;
}

export default function FolderSection({
  folder,
  onAddCredential,
  onBack,
  isAddDisabled = false,
  credentialError,
  onCredentialSelect,
  onCredentialDelete,
  deletingCredentialId,
}: FolderSectionProps) {
  const hasCredentials = folder.credentials.length > 0;

  return (
    <section className="vault-section folder-section">
      {onBack && (
        <div className="folder-section-back">
          <motion.button
            className="back-button"
            onClick={onBack}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ← Back to Folders
          </motion.button>
        </div>
      )}
      <div className="vault-section-heading">
        <div>
          <p className="section-label">Credentials</p>
          <h2>{folder.name}</h2>
        </div>
        <motion.button
          className="create-folder-button"
          onClick={onAddCredential}
          disabled={isAddDisabled}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img src={plusIcon} alt="" />
          Add Credential
        </motion.button>
      </div>

      {credentialError && (
        <motion.div
          className="vault-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {credentialError}
        </motion.div>
      )}

      {hasCredentials ? (
        <div className="folder-credentials-grid">
          {folder.credentials.map((credential) => (
            <article
              key={credential.id}
              className="credential-card"
              onClick={() => onCredentialSelect(credential)}
            >
              <button
                type="button"
                className="credential-delete-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onCredentialDelete(credential.id);
                }}
                disabled={deletingCredentialId === credential.id}
              >
                {deletingCredentialId === credential.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
              <h3>{credential.title}</h3>
            </article>
          ))}
        </div>
      ) : (
        <div className="vault-empty-state">
          <h2>No credentials yet</h2>
          <p>Use the button above to add your first credential.</p>
        </div>
      )}
    </section>
  );
}
