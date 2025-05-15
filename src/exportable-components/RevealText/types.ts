
import { ContentfulClientApi } from "contentful";

export interface RevealTextProps {
  contentfulSpaceId?: string;
  contentfulAccessToken?: string;
  contentfulContentType?: string;
  contentfulEntryId?: string;
  hubspotPortalId?: string;
  hubspotFormId?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonColor?: string;
  defaultText?: string;
  customClient?: ContentfulClientApi<any>;
}

export interface ContentfulRevealText {
  sys: {
    id: string;
  };
  fields: {
    text: string;
  };
}

export interface ContentfulRevealTextResponse {
  items: ContentfulRevealText[];
  total: number;
  sys: any;
}
