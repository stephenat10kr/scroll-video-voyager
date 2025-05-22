
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";

interface ImageSequenceOptions {
  tag?: string;
  prefix?: string;
  limit?: number;
  retry?: number;
}

/**
 * Custom hook to fetch image sequences from Contentful
 * @param options Configuration options for the image sequence query
 * @returns An array of image URLs sorted by filename
 */
export function useContentfulImageSequence(options: ImageSequenceOptions = {}) {
  const { 
    tag = "heroSequence", 
    prefix = "LS_HeroSequence", 
    limit = 250,
    retry = 3
  } = options;
  
  return useQuery({
    queryKey: ['contentfulImageSequence', tag, prefix, limit],
    queryFn: async () => {
      console.log(`Fetching image sequence with tag: ${tag}, prefix: ${prefix}, limit: ${limit}`);
      
      // Query assets with the given tag - using array for tag parameter
      const response = await contentfulClient.getAssets({
        'metadata.tags.sys.id[in]': [tag],
        limit,
        order: ['fields.file.fileName']
      });
      
      console.log(`Found ${response.items.length} total images with tag "${tag}"`);
      
      if (response.items.length === 0) {
        console.warn(`No images found for tag "${tag}". Check if the tag exists in Contentful.`);
        throw new Error(`No images found for tag "${tag}"`);
      }
      
      // Transform and sort the assets
      const filteredAssets = response.items.filter(asset => {
        const fileName = asset.fields.file?.fileName;
        if (!fileName) {
          console.warn(`Asset missing filename: ${asset.sys.id}`);
          return false;
        }
        
        const startsWithPrefix = fileName.startsWith(prefix);
        
        if (!startsWithPrefix) {
          console.log(`Filtering out asset: ${fileName} - doesn't match prefix "${prefix}"`);
        }
        
        return startsWithPrefix;
      });
      
      console.log(`After filtering by prefix "${prefix}": ${filteredAssets.length} images remain`);
      
      if (filteredAssets.length === 0) {
        console.warn(`No images match the prefix "${prefix}". Check your configuration.`);
        throw new Error(`No images match the prefix "${prefix}"`);
      }
      
      // Sort assets by numeric part of filename
      const sortedAssets = filteredAssets.sort((a, b) => {
        // Extract numbers from filenames for proper sorting
        const aMatch = a.fields.file.fileName.match(/(\d+)/);
        const bMatch = b.fields.file.fileName.match(/(\d+)/);
        
        if (aMatch && bMatch) {
          return parseInt(aMatch[0], 10) - parseInt(bMatch[0], 10);
        }
        return 0;
      });
      
      console.log(`Sorted ${sortedAssets.length} images by filename`);
      
      // Map to URLs and check each URL has the expected format
      const imageUrls = sortedAssets.map(asset => {
        if (!asset.fields.file?.url) {
          console.warn(`Asset missing URL: ${asset.sys.id}, ${asset.fields.file?.fileName}`);
          return null;
        }
        
        const url = `https:${asset.fields.file.url}`;
        return url;
      }).filter(Boolean) as string[];
      
      console.log(`Final processed URLs: ${imageUrls.length}`);
      
      // Check if we have a reasonable number of images
      if (imageUrls.length < 10) {
        console.warn(`Only ${imageUrls.length} images were found, which seems unusually low for an image sequence.`);
      }
      
      // Return the image URLs directly - no fallback
      return imageUrls;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: retry, // Configurable retry count
    retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000), // Exponential backoff
  });
}

/**
 * Checks if an image URL is accessible and valid
 * This can be used to verify images
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('Content-Type')?.startsWith('image/');
  } catch (e) {
    console.error("Error validating image URL:", e);
    return false;
  }
}
