
import { createClient } from "contentful";

/**
 * Creates a Contentful client with the provided space ID and access token
 */
export const createContentfulClient = (spaceId: string, accessToken: string) => {
  return createClient({
    space: spaceId,
    accessToken: accessToken,
  });
};

/**
 * Default Contentful client using the values from the original implementation
 * This can be used for backwards compatibility
 */
export const defaultContentfulClient = createContentfulClient(
  "3ca7kmy7bi2k",
  "YmRfMRF19wC31KUpeUuXTnrDBI1KUSXOypFklQ01m_8"
);
