interface Attachment {
  url: string;
  publicId: string;
  format: string;
  resourceType: 'image' | 'raw';
  width?: number;
  height?: number;
  fileSize?: number;
  pages?: number;
}

interface MessageAttachmentsProps {
  attachments: Attachment[];
  onImageClick?: (url: string) => void;
}

export default function MessageAttachments({ attachments, onImageClick }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {attachments.map((attachment, index) => (
        <div key={index} className="relative group">
          {attachment.resourceType === 'image' ? (
            // Image attachment
            <div
              onClick={() => onImageClick?.(attachment.url)}
              className="relative w-40 h-40 rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all"
            >
              <img
                src={attachment.url}
                alt={`Attachment ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <div className="flex items-center gap-1 text-white text-xs">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <span>Agrandir</span>
                </div>
              </div>
            </div>
          ) : (
            // PDF attachment
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                  Document PDF
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  {attachment.pages && <span>{attachment.pages} page{attachment.pages > 1 ? 's' : ''}</span>}
                  {attachment.fileSize && <span>· {formatFileSize(attachment.fileSize)}</span>}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
