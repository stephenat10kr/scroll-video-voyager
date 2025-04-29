
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulRitual, ContentfulRitualsResponse } from "@/types/contentful";

const fetchRituals = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'ritual',
    });
    
    console.log('Contentful rituals response:', response);
    return response as unknown as ContentfulRitualsResponse;
  } catch (error) {
    console.error('Error fetching rituals from Contentful:', error);
    throw error;
  }
};

export const useRituals = () => {
  return useQuery({
    queryKey: ['rituals'],
    queryFn: fetchRituals,
    select: (data) => {
      if (!data || !data.items || !Array.isArray(data.items)) {
        console.error('Invalid data structure received from Contentful for rituals:', data);
        return [];
      }
      
      // Map the data and include orderNumber
      const mappedRituals = data.items.map(item => ({
        id: item.sys.id,
        title: item.fields.title || "",
        description: Array.isArray(item.fields.text) 
          ? item.fields.text 
          : typeof item.fields.text === 'string' 
            ? [item.fields.text] 
            : [],
        imageSrc: item.fields.image?.fields?.file?.url
          ? item.fields.image.fields.file.url.startsWith('//') 
            ? `https:${item.fields.image.fields.file.url}` 
            : item.fields.image.fields.file.url
          : "",
        imageAlt: item.fields.title || "Ritual image",
        orderNumber: typeof item.fields.orderNumber === 'number' ? item.fields.orderNumber : 999
      }));
      
      // Sort by orderNumber
      return mappedRituals.sort((a, b) => a.orderNumber - b.orderNumber);
    }
  });
};
