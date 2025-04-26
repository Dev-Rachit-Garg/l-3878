
import { BrainCircuit, MessageCircle, Youtube, Terminal } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeatureList = () => {
  const features = [
    {
      icon: <Youtube size={24} />,
      title: "Video Analysis",
      description: "Extract and analyze content from any YouTube video quickly",
      delay: "delay-100"
    },
    {
      icon: <BrainCircuit size={24} />,
      title: "AI Summary",
      description: "Get intelligent summaries powered by advanced AI technology",
      delay: "delay-200"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Interactive Chat",
      description: "Discuss the video content with our AI assistant",
      delay: "delay-300"
    },
    {
      icon: <Terminal size={24} />,
      title: "Technical Details",
      description: "View processing status and technical information",
      delay: "delay-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          delay={feature.delay}
        />
      ))}
    </div>
  );
};

export default FeatureList;
