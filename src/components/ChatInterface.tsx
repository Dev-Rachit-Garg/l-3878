
import { useState, useEffect } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  videoId?: string;
  transcript?: string;
}

const ChatInterface = ({ videoId, transcript = "" }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hi! I'm ready to discuss this video with you. What would you like to know?", isUser: false }
  ]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please enter your OpenAI API key first",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setLoading(true);

    try {
      // Create contextual prompt with transcript
      const contextPrompt = transcript 
        ? `This is the transcript of a YouTube video. Please answer the following question based on it.\n\nTranscript:\n${transcript.substring(0, 4000)}\n\nQuestion: ${message}`
        : message;

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
              content: "You are an assistant that can chat based on YouTube video transcripts."
            },
            {
              role: "user",
              content: contextPrompt
            }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      setMessages(prev => [...prev, { 
        text: data.choices[0].message.content, 
        isUser: false 
      }]);
    } catch (error) {
      console.error("Error chatting with AI:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="bg-arcade-terminal/50 backdrop-blur-sm rounded-xl border border-gray-800 flex flex-col h-[600px]">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-arcade-purple" />
          <h3 className="font-medium">Chat about this video</h3>
        </div>
        <div className="text-xs text-gray-400">
          Using transcript context to provide relevant answers
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.isUser
                  ? 'bg-arcade-purple text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 max-w-[80%] rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about the video..."
            className="w-full bg-gray-800 rounded-lg pl-4 pr-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-arcade-purple"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-arcade-purple hover:bg-opacity-90 p-2 rounded-md"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
