
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
        console.log(`Fetching Contentful asset with ID: ${assetId}`);
        const asset = await contentfulClient.getAsset(assetId);
        console.log('Contentful asset response:', asset);
        
        if (asset?.fields?.file?.url) {
          console.log(`Successfully loaded asset: ${asset.fields.file.url}`);
        } else {
          console.warn('Asset loaded but URL might be missing');
        }
        
        return asset as unknown as ContentfulAsset;
      } catch (error) {
        console.error('Error fetching asset from Contentful:', error);
        throw error;
      }
    },
    enabled: !!assetId,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
};
