
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";

const fetchTitles = async () => {
  try {
    const response = await contentfulClient.getEntries({
      'sys.id[in]': '1D65VClsp3AmUlHWdO6QMx,3rT9YboboHcYaHl9EBRcDJ,kmkaxOF3pYwQEupNjlnlA,4QTpBFWwKOHxvE29YnMWFD'
    });
    
    console.log('Contentful titles response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching titles from Contentful:', error);
    throw error;
  }
};

export const useTitles = () => {
  return useQuery({
    queryKey: ['titles'],
    queryFn: fetchTitles,
    select: (data) => {
      if (!data || !data.items || !Array.isArray(data.items)) {
        console.error('Invalid data structure received from Contentful for titles:', data);
        return {
          values: "VALUES",
          rituals: "RITUALS", 
          space: "SPACE",
          questions: "QUESTIONS"
        };
      }
      
      // Create a mapping of IDs to titles
      const titleMap: Record<string, string> = {};
      
      data.items.forEach(item => {
        if (item && item.sys && item.fields) {
          // Extract the title from the fields - assuming it's stored in a 'title' field
          const title = item.fields.title || item.fields.text || "";
          titleMap[item.sys.id] = title;
        }
      });
      
      return {
        values: titleMap['1D65VClsp3AmUlHWdO6QMx'] || "VALUES",
        rituals: titleMap['3rT9YboboHcYaHl9EBRcDJ'] || "RITUALS",
        space: titleMap['kmkaxOF3pYwQEupNjlnlA'] || "SPACE", 
        questions: titleMap['4QTpBFWwKOHxvE29YnMWFD'] || "QUESTIONS"
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
