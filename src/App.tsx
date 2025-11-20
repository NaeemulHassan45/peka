import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./App.css";
import MasterPasswordSetupScreen from "./screens/MasterPasswordSetupScreen";
import VaultScreen from "./screens/VaultScreen";
import WelcomeBackScreen from "./screens/WelcomeBackScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import { listVaults } from "./services/vaultService";
import {
  Screen,
  VaultContext,
  VaultData,
  VaultFolder,
  VaultSummary,
} from "./types";

function App() {
  const [screen, setScreen] = useState<Screen | null>(null);
  const [existingVaults, setExistingVaults] = useState<VaultSummary[]>([]);
  const [activeVault, setActiveVault] = useState<VaultContext | null>(null);
  const [activeFolder, setActiveFolder] = useState<VaultFolder | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const vaults = await listVaults();
        if (!mounted) return;
        setExistingVaults(vaults);
        setScreen(vaults.length > 0 ? "welcomeBack" : "welcome");
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setInitError("Unable to check existing vaults.");
        setScreen("welcome");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const goToLanding = () => {
    setActiveFolder(null);
    setScreen(existingVaults.length > 0 ? "welcomeBack" : "welcome");
  };

  const handleVaultCreated = (vault: VaultContext) => {
    setExistingVaults((prev) => {
      if (prev.some((entry) => entry.path === vault.path)) {
        return prev;
      }
      return [
        ...prev,
        {
          path: vault.path,
          vaultName: vault.data.vaultName,
        },
      ];
    });
    setActiveVault(vault);
    setActiveFolder(null);
    setScreen("vault");
  };

  const handleVaultUnlocked = (vault: VaultContext) => {
    setActiveVault(vault);
    setActiveFolder(null);
    setScreen("vault");
  };

  const handleVaultUpdated = (data: VaultData) => {
    setActiveVault((prev) =>
      prev
        ? {
            ...prev,
            data,
          }
        : prev
    );
    setActiveFolder((prevFolder) => {
      if (!prevFolder) {
        return prevFolder;
      }
      const updatedFolder = data.folders.find(
        (folder) => folder.id === prevFolder.id
      );
      return updatedFolder ?? null;
    });
  };

  const handleVaultDeleted = (path: string) => {
    setExistingVaults((prev) => prev.filter((vault) => vault.path !== path));
    setActiveVault(null);
    setActiveFolder(null);
    setScreen("welcome");
  };

  if (screen === null) {
    return (
      <main className="container">
        <div className="loading-state">Preparing your vault...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen
              onGetStarted={() => setScreen("masterPasswordSetup")}
            />
            {initError && (
              <p className="submit-feedback error landing-error">{initError}</p>
            )}
          </motion.div>
        )}

        {screen === "welcomeBack" && (
          <motion.div
            key="welcomeBack"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeBackScreen
              vaults={existingVaults}
              onUnlock={handleVaultUnlocked}
              onVaultDeleted={handleVaultDeleted}
            />
            {initError && (
              <p className="submit-feedback error landing-error">{initError}</p>
            )}
          </motion.div>
        )}

        {screen === "masterPasswordSetup" && (
          <motion.div
            key="masterPasswordSetup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MasterPasswordSetupScreen
              onVaultCreated={handleVaultCreated}
              onBack={goToLanding}
            />
          </motion.div>
        )}

        {screen === "vault" && activeVault && (
          <motion.div
            key="vault"
            style={{ width: "100%", height: "100%" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VaultScreen
              vaultPath={activeVault.path}
              vault={activeVault.data}
              masterPassword={activeVault.masterPassword}
              onVaultUpdated={handleVaultUpdated}
              onFolderOpen={(folder) => {
                setActiveFolder(folder);
              }}
              activeFolder={activeFolder}
              onFolderClose={() => setActiveFolder(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
