
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulVideoText, ContentfulVideoTextResponse } from "@/types/contentful";

const fetchVideoText = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'videoText',
      limit: 1, // We only need the first entry
    });
    
    console.log('Contentful video text response:', response);
    return response as unknown as ContentfulVideoTextResponse;
  } catch (error) {
    console.error('Error fetching video text from Contentful:', error);
    throw error;
  }
};

export const useVideoText = () => {
  return useQuery({
    queryKey: ['videoText'],
    queryFn: fetchVideoText,
    select: (data) => {
      if (!data || !data.items || !data.items[0] || !data.items[0].fields.videoText) {
        console.error('Invalid data structure received from Contentful for video text:', data);
        return []; // Return empty array as fallback
      }
      
      // Return the videoText array from the first item
      return Array.isArray(data.items[0].fields.videoText) 
        ? data.items[0].fields.videoText 
        : [];
    }
  });
};
