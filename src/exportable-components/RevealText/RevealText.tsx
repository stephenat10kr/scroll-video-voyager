
import React, { useState } from 'react';
import { useRevealTextData } from './useRevealTextData';
import { ContentfulRevealText } from './types';
import Form from './Form';

interface RevealTextProps {
  apiKey?: string;
  spaceId?: string;
  environmentId?: string;
  entryId?: string;
  useLocalData?: boolean;
  defaultText?: string;
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  placeholderText?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  hubspotPortalId?: string;
  hubspotFormId?: string;
}

const RevealText = ({
  apiKey,
  spaceId,
  environmentId = 'master',
  entryId,
  useLocalData = false,
  defaultText,
  headline,
  subheadline,
  buttonText = "SIGN UP",
  placeholderText,
  backgroundColor,
  textColor,
  accentColor,
  hubspotPortalId,
  hubspotFormId,
}: RevealTextProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const displayText = data?.fields.text || defaultText || '';
  const displayHeadline = data?.fields.headline || headline;
  const displaySubheadline = data?.fields.subheadline || subheadline;
  const displayButtonText = data?.fields.buttonText || buttonText;
  const displayPlaceholderText = data?.fields.placeholderText || placeholderText;

  return (
    <div className="reveal-text-component w-full py-24 bg-darkGreen">
      <div className="grid grid-cols-12 max-w-[90%] mx-auto">
        <div className="title-md text-roseWhite col-span-12 md:col-span-9 mb-8" style={{
          background: "linear-gradient(90deg, #FFB577 0%, #FFB577 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          lineHeight: "1.2",
          whiteSpace: "pre-wrap",
          wordBreak: "normal"
        }}>
          {displayText}
        </div>
        <div className="col-span-12 md:col-span-9">
          <button 
            className="h-[48px] rounded-full bg-coral text-black hover:bg-coral/90 px-8 py-2"
            onClick={handleOpenForm}
          >
            {displayButtonText}
          </button>
        </div>
      </div>
      
      <Form 
        open={isFormOpen}
        onClose={handleCloseForm}
        headline={displayHeadline}
        subheadline={displaySubheadline}
        buttonText={displayButtonText}
        placeholderText={displayPlaceholderText}
        backgroundColor={backgroundColor}
        textColor={textColor}
        accentColor={accentColor}
        hubspotPortalId={hubspotPortalId}
        hubspotFormId={hubspotFormId}
      />
    </div>
  );
};

export default RevealText;
