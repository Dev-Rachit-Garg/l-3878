
import { useState } from 'react';
import { Send, Youtube } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import VideoSummary from '@/components/VideoSummary';
import ChatInterface from '@/components/ChatInterface';
import Terminal from '@/components/Terminal';
import FeatureList from '@/components/FeatureList';
import APIKeyInput from '@/components/APIKeyInput';

const Index = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<null | { 
    title: string; 
    thumbnail: string;
    videoId: string;
  }>(null);
  const [transcript, setTranscript] = useState<string>('');
  const { toast } = useToast();

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing video",
      description: "Getting video transcript and generating summary...",
    });

    try {
      // For a full implementation, you would use YouTube Data API
      const videoTitle = await fetchVideoTitle(videoId);
      
      setVideoInfo({
        title: videoTitle || `Video: ${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        videoId: videoId
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process video URL",
        variant: "destructive",
      });
    }
  };

  const fetchVideoTitle = async (videoId: string): Promise<string> => {
    try {
      // Try to fetch the video title from a CORS proxy
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.title || `YouTube Video: ${videoId}`;
      }
    } catch (error) {
      console.error("Error fetching video title:", error);
    }
    
    return `YouTube Video: ${videoId}`;
  };

  const handleTranscriptLoaded = (loadedTranscript: string) => {
    setTranscript(loadedTranscript);
  };

  return (
    <div className="min-h-screen bg-arcade-dark text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-arcade-purple to-arcade-pink bg-clip-text text-transparent">
              YouTube Summary & Chat
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enter a YouTube URL to get an AI-powered summary and chat about the content
          </p>
        </div>

        {/* API Key Input - Now hidden by default since we have a pre-configured key */}
        <div className="mb-2 max-w-2xl mx-auto">
          <details className="text-sm text-gray-400">
            <summary className="cursor-pointer hover:text-gray-300">API Key Settings (Optional)</summary>
            <div className="pt-2">
              <APIKeyInput />
            </div>
          </details>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="w-full bg-arcade-terminal border border-gray-700 rounded-lg pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-arcade-purple"
            />
            <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-arcade-purple hover:bg-opacity-90 p-2 rounded-md"
            >
              <Send size={20} />
            </button>
          </div>
        </form>

        {/* Features Section */}
        <FeatureList />

        {/* Terminal Section */}
        <Terminal />

        {/* Main Content */}
        {videoInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <VideoSummary 
              videoInfo={videoInfo} 
              onTranscriptLoaded={handleTranscriptLoaded} 
            />
            <ChatInterface 
              videoId={videoInfo.videoId} 
              transcript={transcript} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
