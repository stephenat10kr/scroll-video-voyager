
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
        apiKey="your-contentful-api-key"
        spaceId="your-contentful-space-id"
        environmentId="master"
        defaultText="Fallback text if Contentful fails"
      />
      */}
      
      {/* Usage with HubSpot */}
      {/* 
      <RevealText 
        defaultText="Join our community today!"
        headline="Join our newsletter"
        subheadline="Get the latest updates directly to your inbox"
        hubspotPortalId="your-portal-id"
        hubspotFormId="your-form-id"
      />
      */}
      
      {/* Custom styling */}
      {/* 
      <RevealText 
        defaultText="Custom styled reveal text"
        backgroundColor="#000000"
        textColor="#ffffff"
        accentColor="#FFB577"
        buttonText="JOIN NOW"
      />
      */}
    </div>
  );
};

export default RevealTextExample;
