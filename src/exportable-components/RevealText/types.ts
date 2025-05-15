
import { ContentfulClientApi } from 'contentful';

export interface ContentfulRevealText {
  revealText: string;
}

export interface ContentfulRevealTextResponse {
  items: Array<{
    sys: {
      id: string;
    };
    fields: ContentfulRevealText;
  }>;
}

export type ContentfulRevealTextClient = ContentfulClientApi<any>;
