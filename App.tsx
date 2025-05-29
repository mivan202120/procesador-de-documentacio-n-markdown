
import React, { useState, useCallback } from 'react';
import { ProcessedDocument, ProcessSummary, ErrorDetail } from './types';
import { FolderInput } from './components/FolderInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [summary, setSummary] = useState<ProcessSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [fileExtensionConfig, setFileExtensionConfig] = useState<string>(".md");
  const [sourceFolderNameForDisplay, setSourceFolderNameForDisplay] = useState<string | null>(null);
  const [masterDocumentParts, setMasterDocumentParts] = useState<string[]>([]);

  const processFolder = useCallback(async (selectedFiles: FileList, folderNameFromInputHeuristic: string) => {
    setIsLoading(true);
    setCurrentError(null);
    setProcessedDocuments([]);
    setMasterDocumentParts([]);

    // Convert FileList to an array immediately.  Some browsers mutate the
    // FileList when the input value is cleared, so working with a copy ensures
    // we keep access to every file the user selected.
    const filesArray = Array.from(selectedFiles);
    // Sort by the relative path so the processing order is deterministic and
    // matches the folder structure.
    filesArray.sort((a, b) => (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name));

    const newProcessedDocuments: ProcessedDocument[] = [];
    const newErrorDetails: ErrorDetail[] = [];
    let filesProcessedSuccessfully = 0;
    const totalFilesFoundInSelection = filesArray.length;

    console.log(`STARTING FOLDER PROCESSING. Total items from input: ${totalFilesFoundInSelection}, Configured extension: "${fileExtensionConfig}"`);

    if (filesArray.length === 0) {
      console.log("No files selected or FileList is empty.");
      setSummary({
        totalFilesFound: 0,
        filesSuccessfullyProcessed: 0,
        filesFailed: 0,
        errorDetails: [],
        inputDirectoryName: folderNameFromInputHeuristic,
      });
      setSourceFolderNameForDisplay(folderNameFromInputHeuristic);
      setIsLoading(false);
      return;
    }
    
    setSourceFolderNameForDisplay(folderNameFromInputHeuristic);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      
      // Detailed log for every item in FileList
      console.log(`[Loop i=${i}/${totalFilesFoundInSelection-1}] Inspecting item: 
  Name: "${file.name}"
  Size: ${file.size} bytes
  Type: "${file.type}"
  LastModified: ${new Date(file.lastModified).toISOString()}
  WebkitRelativePath: "${file.webkitRelativePath}" (type: ${typeof file.webkitRelativePath})`);

      const lowerCaseFileName = file.name ? file.name.toLowerCase() : "";
      const lowerCaseFileExtension = fileExtensionConfig ? fileExtensionConfig.toLowerCase().trim() : "";

      const passesNameCheck = !!file.name; // File must have a name
      const passesPathCheck = typeof file.webkitRelativePath === 'string'; // webkitRelativePath must be a string
      const passesExtensionCheck = lowerCaseFileExtension !== "" && passesNameCheck && lowerCaseFileName.endsWith(lowerCaseFileExtension); // Name must end with the (non-empty) configured extension

      if (passesNameCheck && passesPathCheck && passesExtensionCheck) {
        console.log(`[Loop i=${i}] PASSED FILTER. Attempting to read: "${file.webkitRelativePath || file.name}"`);
        try {
          const textContent = await file.text();
          
          let pathForDocument = (file.webkitRelativePath && file.webkitRelativePath !== "") 
                                 ? file.webkitRelativePath 
                                 : file.name;
          
          if (typeof pathForDocument !== 'string') {
            pathForDocument = file.name || "unknown_path"; 
          }

          newProcessedDocuments.push({
            sourcePath: pathForDocument,
            textContent: textContent,
          });
          filesProcessedSuccessfully++;
          console.log(`[Loop i=${i}] Successfully read and processed: "${pathForDocument}"`);
        } catch (e: any) {
          let pathForError = (file.webkitRelativePath && file.webkitRelativePath !== "") 
                               ? file.webkitRelativePath 
                               : file.name;
          if (typeof pathForError !== 'string') {
            pathForError = file.name || "unknown_error_path";
          }
          
          newErrorDetails.push({
            filePath: pathForError,
            error: e.message || "Failed to read file content.",
          });
          console.error(`[Loop i=${i}] FAILED to read file: "${pathForError}". Error: ${e.message}`);
        }
      } else {
        console.log(`[Loop i=${i}] SKIPPED item "${file.name}". Filter check details:
  - Has Name (passesNameCheck): ${passesNameCheck} (name: "${file.name}")
  - Path is String (passesPathCheck): ${passesPathCheck} (path: "${file.webkitRelativePath}", type: ${typeof file.webkitRelativePath})
  - Ends With Extension (passesExtensionCheck): ${passesExtensionCheck} (filename: "${lowerCaseFileName}", ext: "${lowerCaseFileExtension}")`);
      }
    }

    console.log("FINISHED FOLDER PROCESSING LOOP.");
    setProcessedDocuments(newProcessedDocuments);
    const aggregatedContent = newProcessedDocuments.map(doc => `### ${doc.sourcePath}\n\n${doc.textContent}`).join("\n\n");
    const partLength = Math.ceil(aggregatedContent.length / 5);
    const parts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const start = i * partLength;
      if (start < aggregatedContent.length) {
        parts.push(aggregatedContent.slice(start, Math.min(start + partLength, aggregatedContent.length)));
      } else {
        parts.push("");
      }
    }
    setMasterDocumentParts(parts);
    setSummary({
      totalFilesFound: totalFilesFoundInSelection,
      filesSuccessfullyProcessed: filesProcessedSuccessfully,
      filesFailed: newErrorDetails.length,
      errorDetails: newErrorDetails,
      inputDirectoryName: folderNameFromInputHeuristic,
    });
    setIsLoading(false);
  }, [fileExtensionConfig]);


  const handleFolderSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const firstFilePath = files[0].webkitRelativePath; 
      let inferredDisplayName = "Selected Content";

      if (firstFilePath) { 
          const pathParts = firstFilePath.split('/');
          if (pathParts.length > 0 && pathParts[0] !== "" && pathParts[0] !== files[0].name) {
            inferredDisplayName = pathParts[0];
          } else { // If webkitRelativePath is just the filename or empty, use the filename
            inferredDisplayName = files[0].name;
          }
      } else if (files[0].name) {
        inferredDisplayName = files[0].name;
      }
      
      console.log(`Folder selected. Heuristic display name: "${inferredDisplayName}". Number of items: ${files.length}`);
      processFolder(files, inferredDisplayName);
    } else {
      console.log("Folder selection event triggered, but no files found in event.target.files.");
    }

    if(event.target) {
      event.target.value = '';
    }
  }, [processFolder]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main className="mt-10 space-y-8">
          <FolderInput
            onFolderSelect={handleFolderSelect}
            isLoading={isLoading}
            fileExtension={fileExtensionConfig}
            onFileExtensionChange={setFileExtensionConfig}
            currentFolderName={sourceFolderNameForDisplay} 
          />
          {currentError && (
            <div className="bg-red-800 border border-red-700 text-red-100 px-4 py-3 rounded-md shadow-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{currentError}</span>
            </div>
          )}
          <ResultsDisplay
            documents={processedDocuments}
            summary={summary}
            isLoading={isLoading}
            masterDocumentParts={masterDocumentParts}
          />
        </main>
        <footer className="text-center mt-12 py-6 border-t border-slate-700">
            <p className="text-sm text-slate-500">Markdown Folder Processor v1.0.3</p> {/* Updated version */}
        </footer>
      </div>
    </div>
  );
};

export default App;
