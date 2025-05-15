
// Define the structure of a Contentful reveal text entry
export interface ContentfulRevealTextEntry {
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

// Form data interface
export interface RevealTextFormData {
  firstName: string;
  lastName: string;
  email: string;
}
