
// Define the structure of a question from Contentful
export interface ContentfulQuestion {
  sys: {
    id: string;
  };
  fields: {
    question: string;
    answer: string;
    tag: string;
  };
}

// Define the structure of the response from Contentful
export interface ContentfulQuestionResponse {
  items: ContentfulQuestion[];
}
