
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "./contentfulClient";
import { ContentfulHeroText, ContentfulHeroTextResponse } from "./types";

// Specific entry IDs for hero text - UPDATE THESE IN THE NEW PROJECT
const HERO_TEXT_IDS = ['11qWRgTIAQpJgN7M81pskc', '4CMwNg4Bf4LvIq0FOPd6Vd'];

const fetchHeroText = async () => {
  try {
    console.log('Fetching hero text entries with specific IDs:', HERO_TEXT_IDS);
    
    const response = await contentfulClient.getEntries({
      content_type: 'heroText',
      'sys.id[in]': HERO_TEXT_IDS,
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
      
      // Map over all items
      const heroTextItems = data.items.map(item => {
        return item as ContentfulHeroText;
      });
      
      // Sort items by orderNumber
      return heroTextItems.sort((a, b) => a.fields.orderNumber - b.fields.orderNumber);
    }
  });
};
