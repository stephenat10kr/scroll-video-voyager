
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulValue, ContentfulValuesResponse } from "@/types/contentful";

const fetchValues = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'values',
    });
    
    console.log('Contentful values response:', response);
    return response as unknown as ContentfulValuesResponse;
  } catch (error) {
    console.error('Error fetching values from Contentful:', error);
    throw error;
  }
};

export const useValues = () => {
  return useQuery({
    queryKey: ['values'],
    queryFn: fetchValues,
    select: (data) => {
      if (!data || !data.items || !Array.isArray(data.items)) {
        console.error('Invalid data structure received from Contentful for values:', data);
        return [];
      }
      
      // Map the data and include orderNumber
      const mappedValues = data.items.map(item => {
        // Ensure we have valid item structure
        if (!item || !item.sys || !item.fields) {
          console.warn('Invalid item structure in values response:', item);
          return null;
        }
        
        return {
          id: item.sys.id,
          valueTitle: item.fields.valueTitle || "",
          valueText: Array.isArray(item.fields.valueText) ? item.fields.valueText : [],
          orderNumber: typeof item.fields.orderNumber === 'number' ? item.fields.orderNumber : 999
        };
      }).filter(Boolean); // Remove any null items
      
      // Sort by orderNumber
      return mappedValues.sort((a, b) => a.orderNumber - b.orderNumber);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
