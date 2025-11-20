import folderIcon from "../assets/folder.svg";
import shieldIcon from "../assets/sheild.svg";
import { VaultFolder } from "../types";

interface VaultFolderCardProps {
  folder: VaultFolder;
  onClick: (folder: VaultFolder) => void;
  onDelete: (folderId: string) => void;
  isDeleting: boolean;
  disableActions?: boolean;
}

export default function VaultFolderCard({
  folder,
  onClick,
  onDelete,
  isDeleting,
  disableActions = false,
}: VaultFolderCardProps) {
  return (
    <article className="vault-folder-card" onClick={() => onClick(folder)}>
      <div className="folder-card-actions">
        <button
          type="button"
          className="folder-delete-button"
          aria-label={`Delete folder ${folder.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(folder.id);
          }}
          disabled={isDeleting || disableActions}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
        {folder.secure && (
          <span className="folder-secure-badge">
            <img src={shieldIcon} alt="Secure" aria-hidden="true" />
          </span>
        )}
      </div>
      <img src={folderIcon} alt="" className="folder-icon" draggable={false} />
      <h3 className="folder-title">{folder.name}</h3>
      <p className="folder-hint">
        {folder.credentials.length} credential
        {folder.credentials.length === 1 ? "" : "s"}
      </p>
    </article>
  );
}

