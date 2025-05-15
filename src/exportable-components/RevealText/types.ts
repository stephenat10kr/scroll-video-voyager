
import { Entry, EntrySkeletonType, ChainModifiers } from 'contentful';
import { ContentfulClientApi } from 'contentful';

export interface RevealTextProps {
  eventTitle?: string;
  isSmall?: boolean;
  titleColor?: string;
}

// Define a content type ID for RevealText entries
export interface RevealTextContentfulData extends EntrySkeletonType {
  fields: {
    teaserText: string;
    headline: string;
    revealText?: string; // Added for backward compatibility
  };
  contentTypeId: 'revealText';
}

export interface RevealTextContentfulResponse {
  items: Entry<RevealTextContentfulData>[];
}

// Define ContentfulRevealTextEntry for the component
export interface ContentfulRevealTextEntry {
  sys: {
    id: string;
  };
  fields: {
    text: string;
  };
}

interface ModifierOptions {
  locale: string;
  preview: boolean;
}

interface Modifiers {
  options: ModifierOptions;
}

export type ContentfulClient = ContentfulClientApi<ChainModifiers>;
