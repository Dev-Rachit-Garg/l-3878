
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Captions } from 'lucide-react';

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
    const fetchTranscript = async () => {
      setLoading(true);
      setTranscriptError(null);
      
      try {
        // In a real production setting, this would be a call to a backend API
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://youtubetranscript.com/?server_vid=${videoInfo.videoId}`)}`)
        const data = await response.text();
        
        let extractedTranscript = "";
        
        try {
          // Extract the transcript from the response
          const parser = new DOMParser();
          const doc = parser.parseFromString(data, "text/html");
          const transcriptElements = doc.querySelectorAll(".transcript-text");
          
          if (transcriptElements.length > 0) {
            extractedTranscript = Array.from(transcriptElements)
              .map(el => el.textContent)
              .join(' ');
          } else {
            throw new Error("Could not find transcript elements");
          }
        } catch (parseError) {
          console.error("Error parsing transcript:", parseError);
          // Fallback to sample transcript if parsing fails
          extractedTranscript = "This is a sample transcript for demonstration purposes. In a real application, you would fetch the actual transcript from YouTube via a proper backend service.";
        }
        
        setTranscript(extractedTranscript);
        
        // Pass transcript to parent component for chat functionality
        if (onTranscriptLoaded) {
          onTranscriptLoaded(extractedTranscript);
        }
        
        // Generate summary with the transcript
        await generateSummary(extractedTranscript);
      } catch (error) {
        console.error("Error fetching transcript:", error);
        setTranscriptError("Failed to fetch video transcript. Using proxy service failed.");
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

    fetchTranscript();
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
      <h2 className="text-xl font-semibold mb-4">{videoInfo.title}</h2>
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
