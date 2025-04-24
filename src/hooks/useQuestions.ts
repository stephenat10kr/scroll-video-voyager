
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
  const response = await contentfulClient.getEntries({
    content_type: 'question'
  });
  return response as ContentfulQuestionResponse;
};

export const useQuestions = () => {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const response = await fetchQuestions();
      
      // Transform and group questions by tag
      const groupedQuestions = response.items.reduce((acc, item) => {
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

      return groupedQuestions;
    }
  });
};
