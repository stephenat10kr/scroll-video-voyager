
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulGalleryResponse } from "@/types/contentful";

const fetchGallery = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'gallery',
      // Removing the order parameter since the field doesn't exist
    });
    
    console.log('Contentful gallery response:', response);
    return response as unknown as ContentfulGalleryResponse;
  } catch (error) {
    console.error('Error fetching gallery from Contentful:', error);
    throw error;
  }
};

export const useGallery = () => {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: fetchGallery,
    select: (data) => {
      // Transform the response into the format expected by the Gallery component
      if (!data || !data.items || !Array.isArray(data.items)) {
        console.error('Invalid data structure received from Contentful:', data);
        return [];
      }
      
      const mediaUrls = data.items
        .filter(item => {
          // Filter out any items that don't have the expected structure
          if (!item?.fields?.media?.fields?.file?.url) {
            console.warn('Found gallery item with missing media fields:', item);
            return false;
          }
          return true;
        })
        .map(item => {
          const url = item.fields.media.fields.file.url;
          // Ensure URLs are HTTPS
          return url.startsWith('//') ? `https:${url}` : url;
        });
      
      console.log('Processed media URLs:', mediaUrls);
      return mediaUrls;
    }
  });
};
