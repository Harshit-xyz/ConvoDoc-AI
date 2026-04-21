interface PdfViewerProps {
  fileUrl?: string;
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  return (
    <div className="w-1/2 bg-gray-100 border-r border-gray-300 flex flex-col hidden lg:flex h-full">
      {fileUrl ? (
        <iframe src={fileUrl} className="w-full h-full" title="Document Viewer" />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          PDF not available
        </div>
      )}
    </div>
  );
}
