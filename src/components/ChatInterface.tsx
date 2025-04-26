
import { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hi! I'm ready to discuss the video with you. What would you like to know?", isUser: false }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    
    // Simulate AI response (you'll need to implement actual AI integration)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I'm processing your question about the video...", 
        isUser: false 
      }]);
    }, 1000);

    setMessage('');
  };

  return (
    <div className="bg-arcade-terminal/50 backdrop-blur-sm rounded-xl border border-gray-800 flex flex-col h-[600px]">
      {/* Chat Messages */}
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
      </div>

      {/* Message Input */}
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
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
