
// ContentfulAsset type
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

// ContentfulHeroText type
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
    heroTextText: string;
    orderNumber: number;
  };
}

// ContentfulHeroTextResponse type
export interface ContentfulHeroTextResponse {
  items: ContentfulHeroText[];
  total: number;
  skip: number;
  limit: number;
}
