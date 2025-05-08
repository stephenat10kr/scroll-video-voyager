
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
      
      const mediaItems = data.items
        .sort((a, b) => (a.fields.orderNumber || 0) - (b.fields.orderNumber || 0))
        .filter(item => {
          if (!item?.fields?.galleryMedia?.fields?.file?.url) {
            console.warn('Found gallery item with missing media fields:', item);
            return false;
          }
          return true;
        })
        .map(item => {
          // Check for caption field and log it for debugging
          if (item.fields.galleryCaption) {
            console.log(`Found caption for item ${item.sys.id}:`, item.fields.galleryCaption);
          } else {
            console.log(`No caption found for item ${item.sys.id}`);
          }
          
          return {
            id: item.sys.id, // Add id property
            mediaUrl: item.fields.galleryMedia.fields.file.url.startsWith('//') 
              ? `https:${item.fields.galleryMedia.fields.file.url}` 
              : item.fields.galleryMedia.fields.file.url,
            type: item.fields.galleryMedia.fields.file.contentType,
            caption: item.fields.galleryCaption || ''
          };
        });
      
      console.log('Processed media items with captions:', mediaItems);
      return mediaItems;
    }
  });
};
