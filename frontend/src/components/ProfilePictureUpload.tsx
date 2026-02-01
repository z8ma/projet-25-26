import { useState, useRef } from 'react';
import { uploadApi } from '../services/api';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  onRemove: () => void;
}

export default function ProfilePictureUpload({ currentImageUrl, onUploadSuccess, onRemove }: ProfilePictureUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setShowEditor(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const getCroppedImage = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = imageRef.current!;

      const size = 400;
      canvas.width = size;
      canvas.height = size;

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Calculate the size of the original image when displayed
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // Calculate aspect ratio
      const aspectRatio = naturalWidth / naturalHeight;

      // Calculate the displayed size (before zoom and position)
      let displayWidth, displayHeight;
      if (aspectRatio > 1) {
        // Landscape
        displayWidth = 400;
        displayHeight = 400 / aspectRatio;
      } else {
        // Portrait or square
        displayHeight = 400;
        displayWidth = 400 * aspectRatio;
      }

      // Apply zoom
      displayWidth *= zoom;
      displayHeight *= zoom;

      // Calculate the position on canvas (center + offset)
      const canvasX = size / 2 - displayWidth / 2 + position.x;
      const canvasY = size / 2 - displayHeight / 2 + position.y;

      // Draw the image
      ctx.drawImage(img, canvasX, canvasY, displayWidth, displayHeight);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.92);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      const croppedBlob = await getCroppedImage();
      const croppedFile = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });

      const response = await uploadApi.uploadBrainstormingFiles(
        [croppedFile],
        (progress) => setUploadProgress(progress)
      );

      if (response.success && response.data.length > 0) {
        onUploadSuccess(response.data[0].url);
        setShowEditor(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      {/* Current/Upload Button */}
      <div className="flex items-center gap-4">
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        <div className="flex-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              {currentImageUrl ? 'Changer' : 'Ajouter'}
            </button>

            {currentImageUrl && (
              <button
                type="button"
                onClick={onRemove}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Supprimer
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG ou GIF (max. 5MB)</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Editor Modal */}
      {showEditor && previewUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold mb-2">Ajuster votre photo</h3>
            <p className="text-sm text-gray-500 mb-4">Glissez pour repositionner, utilisez le zoom pour ajuster</p>

            {/* Preview Area */}
            <div
              ref={containerRef}
              className="relative bg-gray-900 rounded-xl overflow-hidden mb-4 select-none"
              style={{ height: '400px' }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center cursor-move touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-none select-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transition: isDragging ? 'none' : 'transform 0.1s',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                  }}
                  draggable={false}
                />
              </div>

              {/* Circular Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative" style={{ width: '360px', height: '360px' }}>
                  <svg width="100%" height="100%" viewBox="0 0 360 360">
                    <defs>
                      <mask id="circleMask">
                        <rect width="360" height="360" fill="white" />
                        <circle cx="180" cy="180" r="180" fill="black" />
                      </mask>
                    </defs>
                    <rect width="360" height="360" fill="black" opacity="0.6" mask="url(#circleMask)" />
                    <circle cx="180" cy="180" r="179" fill="none" stroke="white" strokeWidth="3" strokeDasharray="8 4" />
                  </svg>
                </div>
              </div>

              {/* Instructions */}
              {!isDragging && (
                <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                  <div className="inline-block bg-black/50 text-white text-sm px-4 py-2 rounded-full">
                    Glissez pour repositionner
                  </div>
                </div>
              )}
            </div>

            {/* Zoom Control */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Zoom</label>
                <span className="text-sm text-gray-500">{zoom.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <button
                  type="button"
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-4 p-3 bg-primary-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary-700 font-medium">Upload en cours...</span>
                  <span className="text-sm text-primary-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-primary-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                disabled={isUploading}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
              >
                {isUploading ? 'Upload...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
