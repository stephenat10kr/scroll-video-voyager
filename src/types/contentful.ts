
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
  };
}

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
