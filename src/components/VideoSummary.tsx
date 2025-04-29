
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Captions, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { fetchTranscript } from '@/utils/transcriptUtils';

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

  const downloadTranscript = () => {
    if (!transcript) {
      toast({
        title: "No Transcript Available",
        description: "Please wait for the transcript to load first.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${videoInfo.title.replace(/[^\w\s]/gi, '')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Transcript Downloaded",
      description: "The transcript has been downloaded successfully.",
    });
  };

  return (
    <div className="bg-arcade-terminal/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{videoInfo.title}</h2>
        <Button 
          onClick={downloadTranscript} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-arcade-purple text-arcade-purple hover:bg-arcade-purple/10"
          disabled={loading || !transcript}
        >
          <FileText size={16} />
          Download Transcript
        </Button>
      </div>
      
      <img
        src={videoInfo.thumbnail}
        alt={videoInfo.title}
        className="w-full rounded-lg mb-4"
      />

      {transcriptError && (
        <div className="bg-orange-900/30 border border-orange-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Captions className="text-orange-400" />
            <h3 className="text-lg font-medium text-orange-400">Transcript Issue</h3>
          </div>
          <p className="text-orange-200">{transcriptError}</p>
          <div className="mt-3 text-sm text-orange-300">
            <p>Using fallback transcript for demonstration. In a production app:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Use a proper backend service to fetch YouTube transcripts</li>
              <li>Create your own API endpoint to avoid CORS restrictions</li>
            </ul>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default VideoSummary;
