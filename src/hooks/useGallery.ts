
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import { ContentfulGalleryResponse } from "@/types/contentful";

const fetchGallery = async () => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'gallery',
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
      if (!data || !data.items || !Array.isArray(data.items)) {
        console.error('Invalid data structure received from Contentful:', data);
        return [];
      }
      
      const mediaUrls = data.items
        .sort((a, b) => (a.fields.orderNumber || 0) - (b.fields.orderNumber || 0))
        .filter(item => {
          if (!item?.fields?.galleryMedia?.fields?.file?.url) {
            console.warn('Found gallery item with missing media fields:', item);
            return false;
          }
          return true;
        })
        .map(item => {
          const url = item.fields.galleryMedia.fields.file.url;
          return url.startsWith('//') ? `https:${url}` : url;
        });
      
      console.log('Processed media URLs:', mediaUrls);
      return mediaUrls;
    }
  });
};
