
import { useState, useEffect } from 'react';
import { ContentfulClient, ContentfulRevealText } from './types';
import { createClient } from 'contentful';
import { Entry, EntryCollection } from 'contentful';

interface UseRevealTextDataProps {
  apiKey?: string;
  spaceId?: string;
  environmentId?: string;
  entryId?: string;
  useLocalData?: boolean;
}

interface UseRevealTextDataReturn {
  data: ContentfulRevealText | null;
  isLoading: boolean;
  error: Error | null;
}

export const useRevealTextData = ({
  apiKey,
  spaceId,
  environmentId = 'master',
  entryId,
  useLocalData = false,
}: UseRevealTextDataProps): UseRevealTextDataReturn => {
  const [data, setData] = useState<ContentfulRevealText | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useLocalData) {
      // Provide default mock data when using local data
      setData({
        sys: { id: 'mock-id' },
        fields: {
          text: 'This is mock text for the RevealText component in local development mode.',
          headline: 'Mock Headline',
          subheadline: 'Mock Subheadline',
          buttonText: 'Sign Up',
          placeholderText: 'Enter your email',
        },
      });
      setIsLoading(false);
      return;
    }

    if (!apiKey || !spaceId) {
      setIsLoading(false);
      setError(new Error('API key and Space ID are required for Contentful'));
      return;
    }

    const fetchData = async () => {
      try {
        const client: ContentfulClient = createClient({
          space: spaceId,
          accessToken: apiKey,
          environment: environmentId,
        });

        if (entryId) {
          // Using proper Contentful types
          const entry = await client.getEntry<any>(entryId);
          
          // Transform the entry to our ContentfulRevealText type with safe type conversions
          const transformedEntry: ContentfulRevealText = {
            sys: entry.sys,
            fields: {
              text: String(entry.fields.text || ''),
              headline: entry.fields.headline ? String(entry.fields.headline) : undefined,
              subheadline: entry.fields.subheadline ? String(entry.fields.subheadline) : undefined,
              buttonText: entry.fields.buttonText ? String(entry.fields.buttonText) : undefined,
              placeholderText: entry.fields.placeholderText ? String(entry.fields.placeholderText) : undefined,
            }
          };
          
          setData(transformedEntry);
        } else {
          // Using proper Contentful types
          const response = await client.getEntries<any>({
            content_type: 'revealText',
            limit: 1,
          });
          
          if (response.items.length > 0) {
            const item = response.items[0];
            
            // Transform the entry to our ContentfulRevealText type with safe type conversions
            const transformedEntry: ContentfulRevealText = {
              sys: item.sys,
              fields: {
                text: String(item.fields.text || ''),
                headline: item.fields.headline ? String(item.fields.headline) : undefined,
                subheadline: item.fields.subheadline ? String(item.fields.subheadline) : undefined,
                buttonText: item.fields.buttonText ? String(item.fields.buttonText) : undefined,
                placeholderText: item.fields.placeholderText ? String(item.fields.placeholderText) : undefined,
              }
            };
            
            setData(transformedEntry);
          } else {
            setError(new Error('No reveal text entries found'));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error fetching reveal text data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiKey, spaceId, environmentId, entryId, useLocalData]);

  return { data, isLoading, error };
};
