
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

export interface ContentfulQuestionResponse {
  items: ContentfulQuestion[];
}
