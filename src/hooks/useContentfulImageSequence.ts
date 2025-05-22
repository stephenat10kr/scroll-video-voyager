
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulAsset } from "@/types/contentful";

interface ImageSequenceOptions {
  tag?: string;
  prefix?: string;
  limit?: number;
}

/**
 * Custom hook to fetch image sequences from Contentful
 * @param options Configuration options for the image sequence query
 * @returns An array of image URLs sorted by filename
 */
export function useContentfulImageSequence(options: ImageSequenceOptions = {}) {
  const { tag = "heroSequence", prefix = "LS_HeroSequence", limit = 250 } = options;
  
  return useQuery({
    queryKey: ['contentfulImageSequence', tag, prefix, limit],
    queryFn: async () => {
      try {
        console.log(`Fetching image sequence with tag: ${tag}, prefix: ${prefix}`);
        
        // Query assets with the given tag
        const response = await contentfulClient.getAssets({
          'metadata.tags.sys.id[in]': tag,
          limit,
          order: 'fields.file.fileName'
        });
        
        console.log(`Found ${response.items.length} images in sequence`);
        
        if (response.items.length === 0) {
          console.warn('No images found for the sequence');
          return [];
        }
        
        // Transform and sort the assets
        const imageUrls = response.items
          .filter(asset => {
            const fileName = asset.fields.file.fileName;
            return fileName && fileName.startsWith(prefix);
          })
          .sort((a, b) => {
            // Extract numbers from filenames for proper sorting
            const aMatch = a.fields.file.fileName.match(/(\d+)/);
            const bMatch = b.fields.file.fileName.match(/(\d+)/);
            
            if (aMatch && bMatch) {
              return parseInt(aMatch[0], 10) - parseInt(bMatch[0], 10);
            }
            return 0;
          })
          .map(asset => {
            const url = `https:${asset.fields.file.url}`;
            console.log(`Processing image: ${asset.fields.file.fileName} -> ${url}`);
            return url;
          });
        
        console.log(`Processed ${imageUrls.length} image URLs`);
        return imageUrls;
      } catch (error) {
        console.error("Error fetching image sequence from Contentful:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Fallback function to get a single test image URL
 * This is used when the image sequence couldn't be loaded
 */
export function getFallbackImageUrl() {
  return "https://images.ctfassets.net/ns3lrpq3pt35/4PvWRZ9PXoEbCFHtHd0n4o/5918c4120ef20f5824def98f1659a0d3/LS_HeroSequence050.jpg";
}
