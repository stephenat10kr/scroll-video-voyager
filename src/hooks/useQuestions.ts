
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
    // The error indicates the content type 'question' doesn't exist
    // Let's try without specifying a content type first to see what's available
    const response = await contentfulClient.getEntries();
    
    console.log('Contentful raw response:', response);
    return response as any;
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
          // Make sure the fields exist and look at what fields are actually available
          console.log('Examining item structure:', item);
          
          // Check if item has all required fields with fallbacks
          const question = item.fields?.question || item.fields?.title || '';
          const answer = item.fields?.answer || item.fields?.content || item.fields?.description || '';
          const tag = item.fields?.tag || item.fields?.category || 'Community';
          
          // Skip items that don't have usable content
          if (!question || !answer) {
            console.warn('Skipping item with missing essential fields:', item);
            return acc;
          }
          
          const transformedTag = transformTag(tag);
          if (!acc[transformedTag]) {
            acc[transformedTag] = [];
          }
          
          acc[transformedTag].push({
            title: question,
            content: answer
          });
          
          return acc;
        }, {} as Record<string, QuestionData[]>);

        console.log('Grouped questions:', groupedQuestions);
        
        // If we didn't get any questions under our predefined tabs, create empty arrays
        const result = { ...groupedQuestions };
        ["THE COMMUNITY", "THE SPACE", "THE MEMBERSHIPS"].forEach(tab => {
          if (!result[tab]) {
            result[tab] = [];
          }
        });
        
        return result;
      } catch (error) {
        console.error('Error processing questions:', error);
        throw error;
      }
    }
  });
};
