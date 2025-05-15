
import React from 'react';
import { useRevealTextData } from './useRevealTextData';
import { ContentfulRevealText } from './types';
import Form from './Form';

interface RevealTextProps {
  apiKey?: string;
  spaceId?: string;
  environmentId?: string;
  entryId?: string;
  useLocalData?: boolean;
}

const RevealText = ({
  apiKey,
  spaceId,
  environmentId = 'master',
  entryId,
  useLocalData = false,
}: RevealTextProps) => {
  const { data, isLoading, error } = useRevealTextData({
    apiKey,
    spaceId,
    environmentId,
    entryId,
    useLocalData,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load data. Please check your credentials and try again.
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const entry = data as ContentfulRevealText;

  return (
    <div className="reveal-text-component">
      <Form 
        headline={entry.headline}
        subheadline={entry.subheadline}
        buttonText={entry.buttonText}
        placeholderText={entry.placeholderText}
      />
    </div>
  );
};

export default RevealText;
