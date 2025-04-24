
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulQuestion, ContentfulQuestionResponse, ContentfulEntryCollection } from "@/types/contentful";
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
    // Fetch questions from Contentful
    const response = await contentfulClient.getEntries({
      content_type: 'questions' // Use the content type ID from Contentful
    });
    
    console.log('Contentful raw response:', response);
    // First cast to unknown, then to our interface to avoid type incompatibility
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
          
          // Get the tag from the fields - now it should be visible
          const tagValue = item.fields.tag || "Community";
          console.log('Tag value found:', tagValue);
          
          const transformedTag = transformTag(tagValue);
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
