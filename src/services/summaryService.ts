
import { useToast } from "@/hooks/use-toast";

export const generateSummary = async (
  transcriptText: string,
  apiKey: string | null,
  setLoading: (loading: boolean) => void,
  setSummary: (summary: string) => void
): Promise<void> => {
  const toast = useToast();
  
  if (!apiKey) {
    toast.toast({
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
    toast.toast({
      title: "Error",
      description: "Failed to generate summary. Please check your API key.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
