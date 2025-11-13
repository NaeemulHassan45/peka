import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import shieldIcon from "../assets/sheild.svg";
import "../css/components/CreateFolderModal.css";

interface CreateFolderModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    secure: boolean;
    pin?: string;
  }) => Promise<void>;
}

const PIN_LENGTH = 4;

export default function CreateFolderModal({
  isOpen,
  isSubmitting,
  onClose,
  onCreate,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [secure, setSecure] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setSecure(false);
      setPin("");
      setError(null);
    }
  }, [isOpen]);

  const isPinValid = useMemo(() => {
    if (!secure) return true;
    return /^\d{4}$/.test(pin);
  }, [pin, secure]);

  const isNameValid = name.trim().length > 0;

  const formValid = isNameValid && isPinValid;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formValid || isSubmitting) {
      setError(
        !isNameValid
          ? "Folder name is required."
          : "PIN must be exactly 4 digits."
      );
      return;
    }
    setError(null);
    await onCreate({
      name: name.trim(),
      secure,
      pin: secure ? pin : undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
          <motion.div
            className="modal-content create-folder-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-folder-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="create-folder-title">Create New Folder</h2>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="folder-name">Folder Name</label>
                <input
                  id="folder-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Personal Accounts"
                  disabled={isSubmitting}
                  className={!isNameValid && name ? "input-error" : ""}
                  autoFocus
                />
              </div>

              <div className="form-group toggle-group toggle-group-left">
                <label htmlFor="secure-folder-toggle">
                  <span>Secure Folder</span>
                  {secure && (
                    <span className="secure-badge-inline">
                      <img src={shieldIcon} alt="" aria-hidden="true" />
                      Protected
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  id="secure-folder-toggle"
                  className={`secure-toggle${secure ? " active" : ""}`}
                  onClick={() => setSecure((prev) => !prev)}
                  disabled={isSubmitting}
                  aria-pressed={secure}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>

              {secure && (
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="folder-pin">
                    Folder PIN <small>(4 digits)</small>
                  </label>
                  <input
                    id="folder-pin"
                    type="tel"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={PIN_LENGTH}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, PIN_LENGTH);
                      setPin(value);
                      setError(null);
                    }}
                    placeholder="••••"
                    disabled={isSubmitting}
                    className={!isPinValid && pin ? "input-error" : ""}
                  />
                  <p className="pin-hint">
                    This PIN will be required to access this folder
                  </p>
                </motion.div>
              )}

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

              <div className="modal-actions spaced">
                <button
                  type="button"
                  className="action-button secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-button"
                  disabled={!formValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="button-loading">
                      <span className="spinner" aria-hidden="true" />
                      Creating...
                    </span>
                  ) : (
                    "Create Folder"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
