
import { ContentfulClientApi, EntryCollection } from 'contentful';

export interface ContentfulRevealText {
  revealText: string;
}

export interface ContentfulRevealTextEntry {
  sys: {
    id: string;
  };
  fields: {
    text: string;
  };
}

export interface ContentfulRevealTextResponse {
  items: Array<{
    sys: {
      id: string;
    };
    fields: ContentfulRevealText;
  }>;
}

// Update the ContentfulRevealTextClient with the required type argument
// Use 'any' as the generic parameter to match default behavior
export type ContentfulRevealTextClient = ContentfulClientApi<any>;
