
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulAsset } from "@/types/contentful";

/**
 * Fetches a specific asset from Contentful by its ID
 */
export const useContentfulAsset = (assetId: string) => {
  return useQuery({
    queryKey: ['contentfulAsset', assetId], // Remove timestamp to allow proper caching
    queryFn: async () => {
      try {
        console.log(`Fetching Contentful asset with ID: ${assetId}`);
        const asset = await contentfulClient.getAsset(assetId);
        console.log('Contentful asset response:', asset);
        
        if (asset?.fields?.file?.url) {
          console.log(`Successfully loaded asset: ${asset.fields.file.url}`);
          console.log(`Asset title: ${asset.fields.title || 'No title'}`);
          console.log(`Asset description: ${asset.fields.description || 'No description'}`);
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes instead of always fetching fresh
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });
};
