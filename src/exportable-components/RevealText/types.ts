
import { ContentfulClientApi, ChainModifiers, EntrySkeletonType } from 'contentful';

// Define the structure of the RevealText data in Contentful
export interface RevealTextContentfulData {
  revealText: string;
}

// Interface for the RevealText content model in Contentful
export interface ContentfulRevealTextEntry {
  sys: {
    id: string;
  };
  fields: {
    text: string;
  };
}

// Interface for the response from Contentful when fetching RevealText entries
export interface ContentfulRevealTextResponse {
  items: Array<{
    sys: {
      id: string;
    };
    fields: RevealTextContentfulData;
  }>;
}

// Type for the Contentful client, specifying ChainModifiers as the type parameter
export type ContentfulRevealTextClient = ContentfulClientApi<ChainModifiers>;
