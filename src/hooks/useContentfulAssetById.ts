
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";

export const useContentfulAssetById = (assetId: string) => {
  return useQuery({
    queryKey: ['contentfulAsset', assetId],
    queryFn: async () => {
      try {
        const asset = await contentfulClient.getAsset(assetId);
        
        if (asset?.fields?.file?.url) {
          // Ensure URL has proper protocol
          let url = asset.fields.file.url;
          if (url.startsWith('//')) {
            url = 'https:' + url;
          } else if (!url.startsWith('http')) {
            url = 'https://' + url;
          }
          
          return {
            url,
            contentType: asset.fields.file.contentType,
            title: asset.fields.title,
            description: asset.fields.description
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching Contentful asset ${assetId}:`, error);
        throw error;
      }
    }
  });
};
