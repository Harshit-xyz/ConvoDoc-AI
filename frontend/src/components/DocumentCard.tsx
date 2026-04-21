import Link from "next/link";
import { FileText, Calendar, ArrowRight, CheckCircle, Clock, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  id: string;
  name: string;
  status: "uploaded" | "processing" | "ready" | "failed";
  createdAt: string;
  subject?: string;
  onDelete?: (id: string) => void;
}

export default function DocumentCard({ id, name, status, createdAt, subject, onDelete }: DocumentCardProps) {
  const statusColors = {
    uploaded: "text-blue-500",
    processing: "text-yellow-500",
    ready: "text-green-500",
    failed: "text-red-500",
  };

  const statusIcons = {
    uploaded: <Clock className="w-4 h-4" />,
    processing: <Clock className="w-4 h-4 animate-pulse" />,
    ready: <CheckCircle className="w-4 h-4" />,
    failed: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div className="relative group">
      {status === "ready" ? (
        <Link href={`/doc/${id}`}>
          <div className="neo-btn p-6 rounded-2xl h-full flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <CardContent id={id} name={name} status={status} createdAt={createdAt} subject={subject} onDelete={onDelete} statusColors={statusColors} statusIcons={statusIcons} />
          </div>
        </Link>
      ) : (
        <div className="neo-btn p-6 rounded-2xl h-full flex flex-col justify-between opacity-75 cursor-not-allowed">
           <CardContent id={id} name={name} status={status} createdAt={createdAt} subject={subject} onDelete={onDelete} statusColors={statusColors} statusIcons={statusIcons} />
        </div>
      )}
      
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute bottom-6 right-6 p-1.5 rounded-lg bg-white/50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
          title="Delete Document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function CardContent({ id, name, status, createdAt, subject, onDelete, statusColors, statusIcons }: any) {
  return (
    <>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-white/50 rounded-xl">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <span className={cn("flex items-center gap-1 text-xs font-bold uppercase tracking-wider", statusColors[status])}>
            {statusIcons[status]}
            {status}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{name}</h3>
        {subject && <p className="text-sm text-gray-500 mb-4">{subject}</p>}
      </div>

      <div className={cn("flex justify-between items-center mt-4 pt-4 border-t border-gray-200/50", onDelete && "pr-8")}>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>
    </>
  );
}
