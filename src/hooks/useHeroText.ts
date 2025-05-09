
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulHeroText, ContentfulHeroTextResponse } from "@/types/contentful";

// Specific entry IDs we want to fetch
const HERO_TEXT_IDS = ['11qWRgTIAQpJgN7M81pskc', '4CMwNg4Bf4LvIq0FOPd6Vd'];

const fetchHeroText = async () => {
  try {
    console.log('Fetching hero text entries with specific IDs:', HERO_TEXT_IDS);
    
    // Query for specific entries by ID - Pass IDs as an array since that's what the API expects
    const response = await contentfulClient.getEntries({
      content_type: 'heroText',
      'sys.id[in]': HERO_TEXT_IDS, // Pass the array directly, not as a comma-separated string
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
    queryKey: ['heroText', HERO_TEXT_IDS],
    queryFn: fetchHeroText,
    select: (data) => {
      if (!data || !data.items || data.items.length === 0) {
        console.error('Invalid data structure received from Contentful for hero text:', data);
        return []; // Return empty array as fallback
      }
      
      console.log('Processing hero text items:', data.items);
      
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
