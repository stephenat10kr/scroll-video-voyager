
import { useState, useEffect } from 'react';
import { ContentfulClient, ContentfulRevealText } from './types';
import { createClient } from 'contentful';

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
          const entry = await client.getEntry<ContentfulRevealText['fields']>(entryId);
          setData(entry as unknown as ContentfulRevealText);
        } else {
          const response = await client.getEntries<ContentfulRevealText['fields']>({
            content_type: 'revealText',
            limit: 1,
          });
          
          if (response.items.length > 0) {
            setData(response.items[0] as unknown as ContentfulRevealText);
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
