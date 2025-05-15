
import { ContentfulClientApi } from 'contentful';

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

export type ContentfulRevealTextClient = ContentfulClientApi;

