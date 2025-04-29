
import { Captions } from 'lucide-react';

interface TranscriptErrorNoticeProps {
  error: string;
}

const TranscriptErrorNotice = ({ error }: TranscriptErrorNoticeProps) => {
  return (
    <div className="bg-orange-900/30 border border-orange-800 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Captions className="text-orange-400" />
        <h3 className="text-lg font-medium text-orange-400">Transcript Issue</h3>
      </div>
      <p className="text-orange-200">{error}</p>
      <div className="mt-3 text-sm text-orange-300">
        <p>Using fallback transcript for demonstration. In a production app:</p>
        <ul className="list-disc ml-5 mt-1">
          <li>Use a proper backend service to fetch YouTube transcripts</li>
          <li>Create your own API endpoint to avoid CORS restrictions</li>
        </ul>
      </div>
    </div>
  );
};

export default TranscriptErrorNotice;
