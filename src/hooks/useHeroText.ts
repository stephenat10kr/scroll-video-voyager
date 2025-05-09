
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulHeroText, ContentfulHeroTextResponse } from "@/types/contentful";

const fetchHeroText = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'heroText',
      limit: 1, // We only need the first entry
    });
    
    console.log('Contentful hero text response:', response);
    return response as unknown as ContentfulHeroTextResponse;
  } catch (error) {
    console.error('Error fetching hero text from Contentful:', error);
    throw error;
  }
};

export const useHeroText = () => {
  return useQuery({
    queryKey: ['heroText'],
    queryFn: fetchHeroText,
    select: (data) => {
      if (!data || !data.items || !data.items[0]) {
        console.error('Invalid data structure received from Contentful for hero text:', data);
        return null; // Return null as fallback
      }
      
      const heroTextData = data.items[0];
      // Check if all required fields are present
      if (!heroTextData.fields.heroTextEyebrow || 
          !heroTextData.fields.heroTextTitle || 
          !heroTextData.fields.heroTextContent) {
        console.error('Missing required fields in Contentful hero text:', heroTextData.fields);
      }
      
      // Return the hero text data
      return heroTextData as ContentfulHeroText;
    }
  });
};
