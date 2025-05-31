import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulQuestion, ContentfulQuestionResponse } from "@/types/contentful";
import { QuestionData } from "@/components/Questions";

const transformTag = (tagId: string) => {
  const tagMap: Record<string, string> = {
    "values": "OUR VALUES",
    "campus": "OUR CAMPUS", 
    "memberships": "OUR MEMBERSHIPS",
    // Keep old mappings for backward compatibility
    "community": "OUR VALUES",
    "space": "OUR CAMPUS",
    "membership": "OUR MEMBERSHIPS"
  };
  return tagMap[tagId] || tagId.toUpperCase();
};

const fetchQuestions = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'questions'
    });
    
    console.log('Contentful raw response:', response);
    return response as unknown as ContentfulQuestionResponse;
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
        const groupedQuestions = response.items.reduce((acc, item) => {
          console.log('Processing item:', item);
          
          // Check if item has required fields
          if (!item.fields || !item.fields.question || !item.fields.answer) {
            console.warn('Skipping item with missing required fields:', item);
            return acc;
          }
          
          // Get the tag from metadata - default to "community" if no tags
          const tagId = item.metadata?.tags?.[0]?.sys?.id || "community";
          console.log('Tag ID found:', tagId);
          
          const transformedTag = transformTag(tagId);
          if (!acc[transformedTag]) {
            acc[transformedTag] = [];
          }
          
          acc[transformedTag].push({
            title: item.fields.question,
            content: item.fields.answer
          });
          
          return acc;
        }, {} as Record<string, QuestionData[]>);

        console.log('Grouped questions:', groupedQuestions);
        
        // Ensure all predefined tabs exist even if empty
        const result = { ...groupedQuestions };
        ["OUR VALUES", "OUR CAMPUS", "OUR MEMBERSHIPS"].forEach(tab => {
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
