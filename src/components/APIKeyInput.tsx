
import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Key } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const APIKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key starting with 'sk-'",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('openai_api_key', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved",
    });
  };

  return (
    <div className="flex gap-2 max-w-2xl mx-auto mb-4">
      <div className="relative flex-1">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key..."
          className="pl-10"
        />
        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      </div>
      <Button onClick={handleSaveKey} variant="secondary">
        Save Key
      </Button>
    </div>
  );
};

export default APIKeyInput;
