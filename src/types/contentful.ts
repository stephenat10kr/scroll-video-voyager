
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
  fields: {
    question: string;
    answer: string;
    tag?: string; // Make tag optional since it might not be present in all entries
  };
}

// Define the structure of the response from Contentful
export interface ContentfulQuestionResponse {
  items: ContentfulQuestion[];
  total: number;
  skip: number;
  limit: number;
}

// Type for Contentful's EntryCollection that we'll use for proper type casting
export interface ContentfulEntryCollection<T> {
  items: Array<{
    sys: {
      id: string;
      contentType?: {
        sys: {
          id: string;
        }
      }
    };
    fields: T;
  }>;
  total: number;
  skip: number;
  limit: number;
}
