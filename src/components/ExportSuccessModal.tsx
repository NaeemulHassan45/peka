import { AnimatePresence, motion } from "framer-motion";
import vaultIcon from "../assets/vault.svg";
import "../css/components/ExportSuccessModal.css";

interface ExportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportSuccessModal({
  isOpen,
  onClose,
}: ExportSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={onClose}
        >
          <motion.div
            className="modal-content export-success-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-success-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="export-success-header">
              <img src={vaultIcon} alt="" className="export-success-icon" />
              <h2 id="export-success-title">Vault Exported Successfully</h2>
            </div>
            <p className="export-success-description">
              Your vault has been saved to the selected location. You can now
              safely backup or transfer this file.
            </p>
            <div className="modal-actions">
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

