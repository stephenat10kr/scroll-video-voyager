
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulHeroText, ContentfulHeroTextResponse } from "@/types/contentful";

const fetchHeroText = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'heroText',
      // Removed the limit: 1 to fetch all entries
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
      if (!data || !data.items || data.items.length === 0) {
        console.error('Invalid data structure received from Contentful for hero text:', data);
        return []; // Return empty array as fallback
      }
      
      // Map over all items
      const heroTextItems = data.items.map(item => {
        // Check if all required fields are present
        if (!item.fields.heroTextEyebrow || 
            !item.fields.heroTextTitle || 
            !item.fields.heroTextContent ||
            item.fields.orderNumber === undefined) {
          console.error('Missing required fields in Contentful hero text:', item.fields);
        }
        
        return item as ContentfulHeroText;
      });
      
      // Sort items by orderNumber
      return heroTextItems.sort((a, b) => a.fields.orderNumber - b.fields.orderNumber);
    }
  });
};
