
import { Loader2 } from 'lucide-react';

interface VideoSummaryContentProps {
  loading: boolean;
  summary: string;
}

const VideoSummaryContent = ({ loading, summary }: VideoSummaryContentProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Hindi Summary</h3>
      <div className="text-gray-300 min-h-[100px]">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" />
            <span>Fetching transcript and generating Hindi summary...</span>
          </div>
        ) : summary ? (
          <p className="whitespace-pre-line">{summary}</p>
        ) : (
          <p>Waiting for summary generation...</p>
        )}
      </div>
    </div>
  );
};

export default VideoSummaryContent;
