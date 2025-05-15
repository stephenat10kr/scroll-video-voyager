
// This file contains types for the RevealText component and related API responses

import { ContentfulClientApi } from "contentful";

// Define the structure of a Contentful reveal text
export interface ContentfulRevealText {
  sys: {
    id: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields: {
    text: string;
  };
}

// Define the structure of the reveal text response from Contentful
export interface ContentfulRevealTextResponse {
  items: ContentfulRevealText[];
  total: number;
  skip: number;
  limit: number;
}

// Type definition for the contentful client
export type ContentfulClient = ContentfulClientApi<any>;
