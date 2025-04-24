
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulGalleryResponse } from "@/types/contentful";

const fetchGallery = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'gallery',
      order: 'fields.order'
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
      const mediaUrls = data.items.map(item => {
        const url = item.fields.media.fields.file.url;
        // Ensure URLs are HTTPS
        return url.startsWith('//') ? `https:${url}` : url;
      });
      
      return mediaUrls;
    }
  });
};

