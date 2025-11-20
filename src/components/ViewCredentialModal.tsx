import { AnimatePresence, motion } from "framer-motion";
import "../css/components/ViewCredentialModal.css";

interface ViewCredentialModalProps {
  isOpen: boolean;
  identifier: string;
  username: string;
  password: string;
  onClose: () => void;
}

export default function ViewCredentialModal({
  isOpen,
  identifier,
  username,
  password,
  onClose,
}: ViewCredentialModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
          <motion.div
            className="modal-content view-credential-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-credential-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="view-credential-title">{identifier}</h2>
            </div>
            <div className="credential-details">
              <div className="detail-row">
                <span className="label">Username / Email</span>
                <span className="value">{username}</span>
              </div>
              <div className="detail-row">
                <span className="label">Password</span>
                <span className="value sensitive">{password}</span>
              </div>
            </div>
            <div className="modal-actions aligned-right">
              <button className="action-button" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

