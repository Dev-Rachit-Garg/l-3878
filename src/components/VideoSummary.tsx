
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { YoutubeTranscript } from 'youtube-transcript';

interface VideoSummaryProps {
  videoInfo: {
    title: string;
    thumbnail: string;
    videoId: string;
  };
}

const VideoSummary = ({ videoInfo }: VideoSummaryProps) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchTranscript = async () => {
      setLoading(true);
      try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoInfo.videoId);
        const fullTranscript = transcriptData.map((item: any) => item.text).join(' ');
        setTranscript(fullTranscript);
        
        // Now generate summary with the transcript
        await generateSummary(fullTranscript);
      } catch (error) {
        console.error("Error fetching transcript:", error);
        toast({
          title: "Error",
          description: "Failed to fetch video transcript. Make sure the video has captions available.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [videoInfo, toast]);

  const generateSummary = async (transcriptText: string) => {
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please enter your OpenAI API key first",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: `Summarize this YouTube video transcript in about 150 words: ${transcriptText.substring(0, 4000)}`
          }],
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      setSummary(data.choices[0].message.content);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-gray-300 min-h-[100px]">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              <span>Fetching transcript and generating summary...</span>
            </div>
          ) : summary ? (
            <p>{summary}</p>
          ) : (
            <p>Waiting for summary generation...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSummary;
