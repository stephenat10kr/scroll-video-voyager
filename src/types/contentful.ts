
// Define the structure of a Contentful tag
interface ContentfulTag {
  sys: {
    id: string;
  };
}

// Define the structure of a question from Contentful
export interface ContentfulQuestion {
  sys: {
    id: string;
    contentType?: {
      sys: {
        id: string;
      }
    }
  };
  metadata: {
    tags: ContentfulTag[];
  };
  fields: {
    question: string;
    answer: string;
  };
}

// Define the structure of the response from Contentful
export interface ContentfulQuestionResponse {
  items: ContentfulQuestion[];
  total: number;
  skip: number;
  limit: number;
}

