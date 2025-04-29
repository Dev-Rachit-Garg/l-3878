
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { fetchTranscript } from '@/utils/transcriptUtils';
import TranscriptErrorNotice from './video/TranscriptErrorNotice';
import VideoSummaryContent from './video/VideoSummaryContent';
import DownloadTranscriptButton from './video/DownloadTranscriptButton';

interface VideoSummaryProps {
  videoInfo: {
    title: string;
    thumbnail: string;
    videoId: string;
  };
  onTranscriptLoaded?: (transcript: string) => void;
}

const VideoSummary = ({ videoInfo, onTranscriptLoaded }: VideoSummaryProps) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getTranscript = async () => {
      setLoading(true);
      setTranscriptError(null);
      
      try {
        const transcriptText = await fetchTranscript(videoInfo.videoId);
        setTranscript(transcriptText);
        
        // Pass transcript to parent component for chat functionality
        if (onTranscriptLoaded) {
          onTranscriptLoaded(transcriptText);
        }
        
        // Generate summary with the transcript
        await generateSummary(transcriptText);
      } catch (error) {
        console.error("Error fetching transcript:", error);
        setTranscriptError("Failed to fetch video transcript. Using fallback transcript.");
        toast({
          title: "Transcript Error",
          description: "Failed to fetch video transcript. Using fallback transcript.",
          variant: "destructive",
        });
        
        // Use fallback transcript for demo purposes
        const fallbackTranscript = "This is a fallback transcript for demonstration purposes. In a real application, you would fetch the actual transcript from YouTube via a backend service.";
        setTranscript(fallbackTranscript);
        
        if (onTranscriptLoaded) {
          onTranscriptLoaded(fallbackTranscript);
        }
        
        generateSummary(fallbackTranscript);
      }
    };

    getTranscript();
  }, [videoInfo, toast, onTranscriptLoaded]);

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
          messages: [
            {
              role: "system",
              content: "You are an assistant that summarizes YouTube transcripts into short and clear Hindi summaries."
            },
            {
              role: "user",
              content: `Please summarize this transcript in Hindi:\n\n${transcriptText.substring(0, 4000)}`
            }
          ],
          temperature: 0.5,
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{videoInfo.title}</h2>
        <DownloadTranscriptButton 
          transcript={transcript}
          disabled={loading || !transcript}
          videoTitle={videoInfo.title}
        />
      </div>
      
      <img
        src={videoInfo.thumbnail}
        alt={videoInfo.title}
        className="w-full rounded-lg mb-4"
      />

      {transcriptError && <TranscriptErrorNotice error={transcriptError} />}

      <VideoSummaryContent loading={loading} summary={summary} />
    </div>
  );
};

export default VideoSummary;
