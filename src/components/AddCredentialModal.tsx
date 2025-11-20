import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import "../css/components/AddCredentialModal.css";

interface AddCredentialModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    identifier: string;
    username: string;
    password: string;
  }) => Promise<void>;
}

export default function AddCredentialModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: AddCredentialModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIdentifier("");
      setPassword("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !username.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    setError(null);
    await onSubmit({
      identifier: identifier.trim(),
      username: username.trim(),
      password,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
          <motion.div
            className="modal-content add-credential-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-credential-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="add-credential-title">Add Credential</h2>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="credential-id">Credential Identifier</label>
                <input
                  id="credential-id"
                  type="text"
                  value={identifier}
                  autoFocus
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Banking"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="credential-username">Username / Email</label>
                <input
                  id="credential-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="example@email.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="credential-password">Password</label>
                <input
                  id="credential-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter password"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="button-loading">
                      <span className="spinner" aria-hidden="true" />
                      Saving...
                    </span>
                  ) : (
                    "Save Credential"
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

