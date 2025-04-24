
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulQuestion, ContentfulQuestionResponse } from "@/types/contentful";
import { QuestionData } from "@/components/Questions";

const transformTag = (tag: string) => {
  const tagMap: Record<string, string> = {
    "Community": "THE COMMUNITY",
    "Space": "THE SPACE",
    "Memberships": "THE MEMBERSHIPS"
  };
  return tagMap[tag] || tag.toUpperCase();
};

const fetchQuestions = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'question'
    });
    
    console.log('Contentful response:', response);
    return response as any; // We'll do the proper type checking in the hook
  } catch (error) {
    console.error('Error fetching questions from Contentful:', error);
    throw error;
  }
};

export const useQuestions = () => {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      try {
        const response = await fetchQuestions();
        
        console.log('Processing response:', response);
        if (!response.items || !Array.isArray(response.items)) {
          console.error('Invalid response format from Contentful:', response);
          throw new Error('Invalid response format from Contentful');
        }
        
        // Transform and group questions by tag
        const groupedQuestions = response.items.reduce((acc, item: any) => {
          // Make sure the fields exist
          if (!item.fields || !item.fields.question || !item.fields.answer || !item.fields.tag) {
            console.warn('Skipping item with missing fields:', item);
            return acc;
          }
          
          const tag = transformTag(item.fields.tag);
          if (!acc[tag]) {
            acc[tag] = [];
          }
          
          acc[tag].push({
            title: item.fields.question,
            content: item.fields.answer
          });
          
          return acc;
        }, {} as Record<string, QuestionData[]>);

        console.log('Grouped questions:', groupedQuestions);
        return groupedQuestions;
      } catch (error) {
        console.error('Error processing questions:', error);
        throw error;
      }
    }
  });
};
