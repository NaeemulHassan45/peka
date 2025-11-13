import { motion } from "framer-motion";
import { VaultFolder } from "../types";
import "../css/screens/FolderScreen.css";

interface FolderScreenProps {
  folder: VaultFolder;
  onBack: () => void;
}

export default function FolderScreen({ folder, onBack }: FolderScreenProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="folder-screen"
    >
      <div className="folder-screen-header">
        <motion.button
          className="back-button"
          onClick={onBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Back
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {folder.name}
        </motion.h1>
      </div>

      <div className="folder-screen-content">
        <p className="folder-empty-message">
          This folder is empty. Credentials will be displayed here.
        </p>
      </div>
    </motion.section>
  );
}

