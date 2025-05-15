
import { Entry } from 'contentful';
import { ContentfulClientApi } from 'contentful';

export interface RevealTextProps {
  eventTitle?: string;
  isSmall?: boolean;
  titleColor?: string;
}

export interface RevealTextContentfulData {
  teaserText: string;
  headline: string;
}

export interface RevealTextContentfulResponse {
  items: Entry<RevealTextContentfulData>[];
}

interface ModifierOptions {
  locale: string;
  preview: boolean;
}

interface Modifiers {
  options: ModifierOptions;
}

export type ContentfulClient = ContentfulClientApi<unknown>;
