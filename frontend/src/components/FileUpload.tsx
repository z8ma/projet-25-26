import { useState, useRef } from 'react';
import type { DragEvent } from 'react';

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'pdf';
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  compact?: boolean; // icon-only mode for inline input bar
}

export default function FileUpload({ onFilesSelected, maxFiles = 5, maxSize = 15, compact = false }: FileUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  const validateFile = (file: File): boolean => {
    // Check type
    if (!acceptedTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Utilisez JPG, PNG, GIF, WebP ou PDF.');
      return false;
    }

    // Check size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      setError(`Fichier trop volumineux. Taille max: ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const processFiles = (fileList: FileList | File[]) => {
    setError('');
    const filesArray = Array.from(fileList);

    // Check max files
    if (files.length + filesArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    const validFiles: FilePreview[] = [];

    filesArray.forEach((file) => {
      if (!validateFile(file)) return;

      const type = file.type.startsWith('image/') ? 'image' : 'pdf';
      const preview = type === 'image' ? URL.createObjectURL(file) : '';

      validFiles.push({ file, preview, type });
    });

    if (validFiles.length > 0) {
      const newFiles = [...files, ...validFiles];
      setFiles(newFiles);
      onFilesSelected(newFiles.map((f) => f.file));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles.map((f) => f.file));

    // Revoke preview URL to free memory
    if (files[index].preview) {
      URL.revokeObjectURL(files[index].preview);
    }
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    onFilesSelected([]);
    setError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Compact mode: just an icon button + previews strip
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
          title="Ajouter des fichiers (images, PDF)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        {files.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type === 'image' ? (
                  <img src={file.preview} alt={file.file.name} className="w-8 h-8 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-8 h-8 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                    <span className="text-[9px] font-bold text-red-500">PDF</span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" onChange={handleFileInput} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex items-start gap-2 flex-wrap p-3 bg-gray-50 rounded-xl">
          <div className="flex flex-wrap gap-2 flex-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {file.type === 'image' ? (
                  <div className="w-20 h-20 relative">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full transition-opacity"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 flex flex-col items-center justify-center p-2 relative">
                    <svg className="w-8 h-8 text-red-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] text-gray-500 font-medium">PDF</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-0.5 bg-red-500 text-white rounded-full transition-opacity"
                      title="Supprimer"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <p className="text-[9px] text-white font-medium truncate">{file.file.name}</p>
                  <p className="text-[8px] text-gray-200">{formatFileSize(file.file.size)}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={clearAll}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Tout supprimer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${
          isDragging
            ? 'border-orange-400 bg-orange-50'
            : 'border-gray-200 hover:border-orange-300 bg-gray-50 hover:bg-orange-50/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isDragging ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'Déposez vos fichiers ici' : 'Glissez des fichiers ou cliquez pour parcourir'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Images (JPG, PNG, GIF, WebP) ou PDF · Max {maxSize}MB · {maxFiles} fichiers max
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
