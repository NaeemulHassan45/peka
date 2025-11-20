import { AnimatePresence, motion } from "framer-motion";
import vaultIcon from "../assets/vault.svg";
import "../css/components/DeleteVaultConfirmModal.css";

interface DeleteVaultConfirmModalProps {
  isOpen: boolean;
  vaultName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteVaultConfirmModal({
  isOpen,
  vaultName,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteVaultConfirmModalProps) {
  const handleConfirm = () => {
    if (!isDeleting) {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={isDeleting ? undefined : onClose}
        >
          <motion.div
            className="modal-content delete-vault-confirm-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-vault-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-vault-header">
              <img src={vaultIcon} alt="" className="delete-vault-icon" />
              <h2 id="delete-vault-title">Delete Vault</h2>
            </div>
            <p className="delete-vault-description">
              Are you sure you want to delete <strong>{vaultName}</strong>? This
              action cannot be undone. All encrypted data will be permanently
              lost.
            </p>
            <div className="modal-actions spaced">
              <button
                type="button"
                className="action-button secondary"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-button delete-confirm-button"
                onClick={handleConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="button-loading">
                    <span className="spinner" aria-hidden="true" />
                    Deleting...
                  </span>
                ) : (
                  "Delete Vault"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

