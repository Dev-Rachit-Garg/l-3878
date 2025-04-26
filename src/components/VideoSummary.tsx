
interface VideoSummaryProps {
  videoInfo: {
    title: string;
    thumbnail: string;
  };
}

const VideoSummary = ({ videoInfo }: VideoSummaryProps) => {
  return (
    <div className="bg-arcade-terminal/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold mb-4">{videoInfo.title}</h2>
      <img
        src={videoInfo.thumbnail}
        alt={videoInfo.title}
        className="w-full rounded-lg mb-4"
      />
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Summary</h3>
        <div className="text-gray-300">
          <p>The summary of the video will appear here after processing the transcript...</p>
        </div>
      </div>
    </div>
  );
};

export default VideoSummary;
