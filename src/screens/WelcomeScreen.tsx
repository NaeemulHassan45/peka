import { motion } from "framer-motion";
import "../css/screens/WelcomeScreen.css";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to PEKA: Your Private, Local Vault.
      </motion.h1>
      <motion.p
        className="description"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        PEKA is a secure, cross-platform password manager designed for total
        control. Your encrypted credentials are stored only on your device,
        ensuring maximum privacy and peace of mind. Let's get started.
      </motion.p>

      <motion.div
        className="card-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="card-section">
          <motion.h2
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Create New Vault
          </motion.h2>
          <p className="section-description">
            Establish your Master Password and securely create a new, encrypted
            vault file on your current device. This is ideal if you are a
            first-time user of PEKA.
          </p>
          <motion.button
            className="action-button"
            whileHover={{ scale: 1.05, backgroundColor: "#e5e5e5" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={onGetStarted}
          >
            Get Started
          </motion.button>
        </div>

        <div className="divider"></div>

        <div className="card-section">
          <motion.h2
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Import Existing Vault
          </motion.h2>
          <p className="section-description">
            Already have a PEKA vault file? Select your .vault file and enter
            your previous Master Password to unlock and access your credentials
            on this device.
          </p>
          <motion.button
            className="action-button"
            whileHover={{ scale: 1.05, backgroundColor: "#e5e5e5" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Import Vault
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
