
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulAsset } from "@/types/contentful";

/**
 * Fetches a specific asset from Contentful by its ID
 */
export const useContentfulAsset = (assetId: string) => {
  return useQuery({
    queryKey: ['contentfulAsset', assetId],
    queryFn: async () => {
      try {
        const asset = await contentfulClient.getAsset(assetId);
        console.log('Contentful asset response:', asset);
        return asset as unknown as ContentfulAsset;
      } catch (error) {
        console.error('Error fetching asset from Contentful:', error);
        throw error;
      }
    },
    enabled: !!assetId
  });
};
