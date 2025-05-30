// Define the structure of a Contentful tag
interface ContentfulTag {
  sys: {
    id: string;
  };
}

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
  metadata: {
    tags: ContentfulTag[];
  };
  fields: {
    question: string;
    answer: string;
  };
}

// Define the structure of the response from Contentful
export interface ContentfulQuestionResponse {
  items: ContentfulQuestion[];
  total: number;
  skip: number;
  limit: number;
}

// Define the structure of a Contentful asset
export interface ContentfulAsset {
  sys: {
    id: string;
  };
  fields: {
    file: {
      url: string;
      contentType: string;
    };
    title?: string;
    description?: string;
  };
}

// Define the hero video asset IDs
export const HERO_VIDEO_ASSET_ID = "2m5qExRLz3WlRJQiUhP0aB";
export const HERO_VIDEO_PORTRAIT_ASSET_ID = "2m5qExRLz3WlRJQiUhP0aB"; // Using same video for both for now

// Define the structure of a gallery entry from Contentful
export interface ContentfulGalleryEntry {
  sys: {
    id: string;
  };
  fields: {
    galleryMedia: ContentfulAsset;
    orderNumber: number;
    galleryCaption?: string;
  };
}

// Define the structure of the gallery response from Contentful
export interface ContentfulGalleryResponse {
  items: ContentfulGalleryEntry[];
  total: number;
  skip: number;
  limit: number;
}

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

// Define the structure of a Contentful value
export interface ContentfulValue {
  sys: {
    id: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields: {
    valueTitle: string;
    valueText: string[];
    orderNumber: number;
  };
}

// Define the structure of the values response from Contentful
export interface ContentfulValuesResponse {
  items: ContentfulValue[];
  total: number;
  skip: number;
  limit: number;
}

// Define the structure of a Contentful hero text
export interface ContentfulHeroText {
  sys: {
    id: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields: {
    heroTextEyebrow: string;
    heroTextTitle: string;
    heroTextText: string; // Changed from heroTextContent to heroTextText to match API response
    orderNumber: number;
  };
}

// Define the structure of the hero text response from Contentful
export interface ContentfulHeroTextResponse {
  items: ContentfulHeroText[];
  total: number;
  skip: number;
  limit: number;
}

// Define the structure of a Contentful video text
export interface ContentfulVideoText {
  sys: {
    id: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields: {
    videoText: string[];
  };
}

// Define the structure of the video text response from Contentful
export interface ContentfulVideoTextResponse {
  items: ContentfulVideoText[];
  total: number;
  skip: number;
  limit: number;
}

// Define the structure of a ritual from Contentful
export interface ContentfulRitual {
  sys: {
    id: string;
    contentType?: {
      sys: {
        id: string;
      }
    }
  };
  fields: {
    title: string;
    text: string | string[];
    image: ContentfulAsset;
    orderNumber?: number;
  };
}

// Define the structure of the rituals response from Contentful
export interface ContentfulRitualsResponse {
  items: ContentfulRitual[];
  total: number;
  skip: number;
  limit: number;
}
