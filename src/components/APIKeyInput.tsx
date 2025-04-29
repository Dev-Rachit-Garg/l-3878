
import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Key, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const APIKeyInput = () => {
  const defaultApiKey = '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';
  const [apiKey, setApiKey] = useState(defaultApiKey);
  const [isKeySet, setIsKeySet] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if key exists in localStorage
    const savedKey = localStorage.getItem('openai_api_key');
    
    if (!savedKey) {
      // If no key in localStorage, save the default key
      localStorage.setItem('openai_api_key', defaultApiKey);
      setIsKeySet(true);
      toast({
        title: "API Key Pre-configured",
        description: "A default OpenAI API key has been set for you",
      });
    } else {
      // If key exists, use it and mark as set
      setApiKey(savedKey);
      setIsKeySet(true);
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
    setIsKeySet(true);
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
          className={`pl-10 ${isKeySet ? 'border-green-500' : ''}`}
        />
        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        {isKeySet && (
          <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
        )}
      </div>
      <Button onClick={handleSaveKey} variant="secondary">
        Save Key
      </Button>
    </div>
  );
};

export default APIKeyInput;
