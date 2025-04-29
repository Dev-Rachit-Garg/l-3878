
import * as YouTubeTranscript from 'youtube-transcript';

export const fetchTranscript = async (videoId: string): Promise<string> => {
  try {
    // First attempt: Use the youtube-transcript package
    const transcriptItems = await YouTubeTranscript.fetchTranscript(videoId);
    
    if (transcriptItems && transcriptItems.length > 0) {
      // Convert transcript items to a single string
      return transcriptItems.map(item => item.text).join(' ');
    }
    
    throw new Error('No transcript found');
  } catch (packageError) {
    console.error('Error with youtube-transcript package:', packageError);
    
    // Second attempt: Try with YouTube's oEmbed API to get basic video info
    // (This won't get the transcript but helps us fail more gracefully)
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyDAqB7D20DrCxvmAtd9W9ppcURaTPqVtIw`);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        // We have video info but no transcript
        throw new Error('Video found but transcript is not available');
      } else {
        throw new Error('Video not found');
      }
    } catch (apiError) {
      console.error('Fallback API error:', apiError);
      throw new Error('Failed to fetch transcript from all available methods');
    }
  }
};
