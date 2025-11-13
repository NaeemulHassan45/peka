import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import shieldIcon from "../assets/sheild.svg";
import "../css/components/FolderPinModal.css";

interface FolderPinModalProps {
  isOpen: boolean;
  folderName: string;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  onSuccess: () => void;
}

const PIN_LENGTH = 4;

export default function FolderPinModal({
  isOpen,
  folderName,
  onClose,
  onVerify,
  onSuccess,
}: FolderPinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(numericValue);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== PIN_LENGTH) {
      setError("PIN must be 4 digits");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await onVerify(pin);
      if (isValid) {
        setPin("");
        onSuccess();
      } else {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch (err) {
      setError("Failed to verify PIN. Please try again.");
      setPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    if (!isVerifying) {
      setPin("");
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={handleClose}
        >
          <motion.div
            className="modal-content pin-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pin-modal-header">
              <img src={shieldIcon} alt="" className="pin-modal-icon" />
              <h2 id="pin-modal-title">Secure Folder</h2>
            </div>

            <p className="pin-modal-description">
              Enter the 4-digit PIN to access <strong>{folderName}</strong>
            </p>

            <form className="pin-modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="folder-pin-input">PIN</label>
                <input
                  id="folder-pin-input"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={PIN_LENGTH}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••"
                  disabled={isVerifying}
                  className={error ? "input-error" : ""}
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

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-button secondary"
                  onClick={handleClose}
                  disabled={isVerifying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-button"
                  disabled={pin.length !== PIN_LENGTH || isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Unlock"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
