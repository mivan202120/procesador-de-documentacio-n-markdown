
export interface ProcessedDocument {
  sourcePath: string;
  textContent: string;
}

export interface ErrorDetail {
  filePath: string;
  error: string;
}

export interface ProcessSummary {
  totalFilesFound: number; // Total files in the selected folder structure provided by the input
  filesSuccessfullyProcessed: number; // Files matching extension and read successfully
  filesFailed: number; // Files matching extension but failed to read
  errorDetails: ErrorDetail[];
  inputDirectoryName?: string; // Name of the root directory selected by the user
}
