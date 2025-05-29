
import React, { useState } from 'react';
import { ProcessedDocument, ProcessSummary } from '../types';

// Simple ChevronDown Icon SVG
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4 ml-1"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// Simple ChevronUp Icon SVG
const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4 ml-1"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);


const DocumentItem: React.FC<{ document: ProcessedDocument }> = ({ document }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_PREVIEW_CHARS = 250;
  const isLongContent = document.textContent.length > MAX_PREVIEW_CHARS;
  
  const displayText = isLongContent && !isExpanded 
    ? document.textContent.substring(0, MAX_PREVIEW_CHARS) + "..." 
    : document.textContent;

  if (document.textContent.length === 0 && !isLongContent) { // Also check !isLongContent to prevent showing empty file if it was just truncated to nothing
    return (
      <div className="bg-slate-800 p-4 rounded-lg shadow-md">
        <h3 className="text-base font-semibold text-sky-400 break-all">{document.sourcePath}</h3>
        <p className="mt-2 text-xs text-slate-500 italic">(Archivo vacío)</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-base font-semibold text-sky-400 break-all">{document.sourcePath}</h3>
      <div className="mt-2 text-sm text-slate-300">
        <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
          {displayText}
        </pre>
      </div>
      {isLongContent && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-xs text-sky-500 hover:text-sky-300 focus:outline-none focus:underline flex items-center"
        >
          {isExpanded ? 'Mostrar Menos' : 'Mostrar Más'}
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      )}
    </div>
  );
};

interface ResultsDisplayProps {
  documents: ProcessedDocument[];
  summary: ProcessSummary | null;
  isLoading: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ documents, summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
        <p className="mt-4 text-slate-300 text-lg">Procesando archivos...</p>
      </div>
    );
  }

  if (!summary && documents.length === 0) {
    return (
        <div className="text-center p-10 bg-slate-800 rounded-lg shadow-xl">
            <FolderOpenIcon className="h-16 w-16 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 text-lg">
                Seleccione una carpeta para comenzar el procesamiento.
            </p>
            <p className="text-xs text-slate-500 mt-2">
                Los resultados y un resumen aparecerán aquí.
            </p>
        </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {summary && (
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-sky-400 mb-4">Resumen del Procesamiento</h2>
          {summary.inputDirectoryName && <p className="text-md text-slate-300 mb-1"><strong>Carpeta Seleccionada:</strong> <span className="font-mono text-sky-300">{summary.inputDirectoryName}</span></p>}
          <p className="text-md text-slate-300 mb-1"><strong>Total de Archivos Encontrados en Selección:</strong> {summary.totalFilesFound}</p>
          <p className="text-md text-green-400 mb-1"><strong>Archivos Procesados Exitosamente:</strong> {summary.filesSuccessfullyProcessed}</p>
          <p className="text-md text-red-400"><strong>Archivos Fallidos:</strong> {summary.filesFailed}</p>
          
          {summary.filesFailed > 0 && summary.errorDetails.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-700">
              <h4 className="text-lg font-semibold text-amber-400 mb-2">Detalles de Errores:</h4>
              <ul className="list-disc list-inside text-sm text-amber-500 space-y-1 max-h-48 overflow-y-auto pr-2">
                {summary.errorDetails.map((err, index) => (
                  <li key={index} className="break-all">
                    <strong className="font-mono">{err.filePath}:</strong> {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2"> {/* Reduced space between document title and items */}
          <h2 className="text-2xl font-semibold text-sky-400 mb-4">Documentos Procesados</h2>
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <DocumentItem key={`${doc.sourcePath}-${index}`} document={doc} />
            ))}
          </div>
        </div>
      )}
      
      {summary && summary.totalFilesFound > 0 && summary.filesSuccessfullyProcessed === 0 && documents.length === 0 && !isLoading && (
         <div className="text-center p-10 bg-slate-800 rounded-lg shadow-xl">
            <FileQuestionIcon className="h-16 w-16 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 text-lg">
                No se procesaron archivos que coincidan con la extensión desde '{summary.inputDirectoryName}'.
            </p>
            <p className="text-xs text-slate-500 mt-2">
                Verifique la extensión del archivo o el contenido de la carpeta.
            </p>
        </div>
      )}
       {summary && summary.totalFilesFound === 0 && !isLoading && (
         <div className="text-center p-10 bg-slate-800 rounded-lg shadow-xl">
            <EmptyFolderIcon className="h-16 w-16 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 text-lg">
                La carpeta seleccionada '{summary.inputDirectoryName}' parece estar vacía o no se pudo acceder a ningún archivo.
            </p>
         </div>
      )}
    </div>
  );
};


// Placeholder Icons for initial state message
const FolderOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
  </svg>
);

const FileQuestionIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v.01M12 16v.01" />
 </svg>
);

const EmptyFolderIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 14.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
 </svg>
);

