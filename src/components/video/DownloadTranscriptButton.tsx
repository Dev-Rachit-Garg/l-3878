
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface DownloadTranscriptButtonProps {
  transcript: string;
  disabled: boolean;
  videoTitle: string;
}

const DownloadTranscriptButton = ({ transcript, disabled, videoTitle }: DownloadTranscriptButtonProps) => {
  const { toast } = useToast();

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
    a.download = `${videoTitle.replace(/[^\w\s]/gi, '')}_transcript.txt`;
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
    <Button 
      onClick={downloadTranscript} 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2 border-arcade-purple text-arcade-purple hover:bg-arcade-purple/10"
      disabled={disabled}
    >
      <FileText size={16} />
      Download Transcript
    </Button>
  );
};

export default DownloadTranscriptButton;
