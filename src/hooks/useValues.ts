
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";

interface ContentfulValue {
  sys: {
    id: string;
  };
  fields: {
    valueTitle: string;
    valueText: string[];
  };
}

interface ContentfulValuesResponse {
  items: ContentfulValue[];
  total: number;
  skip: number;
  limit: number;
}

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
      
      return data.items.map(item => ({
        id: item.sys.id,
        valueTitle: item.fields.valueTitle || "",
        valueText: Array.isArray(item.fields.valueText) ? item.fields.valueText : []
      }));
    }
  });
};
