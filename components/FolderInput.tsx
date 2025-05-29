
import React, { useRef } from 'react';

interface FolderInputProps {
  onFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  fileExtension: string;
  onFileExtensionChange: (newExtension: string) => void;
  currentFolderName: string | null;
}

// Simple Folder Icon SVG
const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-2"} viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
  </svg>
);

export const FolderInput: React.FC<FolderInputProps> = ({
  onFolderSelect,
  isLoading,
  fileExtension,
  onFileExtensionChange,
  currentFolderName
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
        <div className="flex-grow">
          <label htmlFor="fileExtension" className="block text-sm font-medium text-slate-300 mb-1">
            Extensión de archivo a procesar
          </label>
          <input
            type="text"
            id="fileExtension"
            value={fileExtension}
            onChange={(e) => onFileExtensionChange(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500"
            placeholder=".md"
            disabled={isLoading}
          />
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center"
        >
          <FolderIcon className="h-5 w-5 mr-2 shrink-0" />
          <span className="truncate">
            {isLoading ? 'Procesando...' : (currentFolderName ? `Procesar de nuevo '${currentFolderName}'` : 'Seleccionar Carpeta')}
          </span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFolderSelect}
          // @ts-ignore 'webkitdirectory' and 'directory' are non-standard but widely supported for folder selection
          webkitdirectory="" 
          directory=""
          multiple // Allows selection of multiple files within the directory
          className="hidden" // Hide the default input, use custom button
          disabled={isLoading}
          accept={fileExtension || ".md"} // Hint for file types, though webkitdirectory ignores it
        />
      </div>
      {currentFolderName && !isLoading && (
        <p className="mt-3 text-xs text-slate-400">
          Actualmente mostrando contenido de: <span className="font-semibold text-sky-400">{currentFolderName}</span>
        </p>
      )}
       {!currentFolderName && !isLoading && (
        <p className="mt-3 text-xs text-slate-500">
          Ninguna carpeta seleccionada.
        </p>
      )}
    </div>
  );
};
