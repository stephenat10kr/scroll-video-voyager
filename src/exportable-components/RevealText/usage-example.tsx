
import React from 'react';
import RevealText from './RevealText';

// Example of how to use the RevealText component
const RevealTextExample = () => {
  return (
    <div>
      {/* Basic usage */}
      <RevealText 
        defaultText="This is a reveal text that animates on scroll. The text will be highlighted and then fade out as you scroll down the page."
        buttonText="SIGN UP NOW"
      />
      
      {/* Usage with Contentful */}
      {/* 
      <RevealText 
        contentfulSpaceId="your-space-id"
        contentfulAccessToken="your-access-token"
        defaultText="Fallback text if Contentful fails"
      />
      */}
      
      {/* Usage with HubSpot */}
      {/* 
      <RevealText 
        defaultText="Join our community today!"
        hubspotPortalId="your-portal-id"
        hubspotFormId="your-form-id"
        formTitle="Sign up for updates"
      />
      */}
      
      {/* Custom styling */}
      {/* 
      <RevealText 
        defaultText="Custom styled reveal text"
        backgroundColor="#000000"
        textColor="#ffffff"
        textGradient="linear-gradient(90deg, #ff0000 0%, #ffff00 100%)"
        buttonClassName="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      />
      */}
    </div>
  );
};

export default RevealTextExample;
