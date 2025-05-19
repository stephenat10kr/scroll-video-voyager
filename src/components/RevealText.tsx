import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import type { ContentfulRevealText } from "@/types/contentful";
import Form from "@/components/Form";
import { colors } from "@/lib/theme";
import { useIsIOS } from "@/hooks/useIsIOS";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// HubSpot Portal ID and Form ID matching those in Navigation.tsx
const HUBSPOT_PORTAL_ID = "242761887";
const HUBSPOT_FORM_ID = "ed4555d7-c442-473e-8ae1-304ca35edbf0";

const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isIOS = useIsIOS();
  
  useEffect(() => {
    console.log("RevealText isIOS:", isIOS);
  }, [isIOS]);
  
  const {
    data: revealTextContent,
    isLoading,
    error
  } = useQuery({
    queryKey: ['revealText'],
    queryFn: async () => {
      console.log("Fetching reveal text from Contentful");
      try {
        // Log available content types to see what we have in the space
        const contentTypes = await contentfulClient.getContentTypes();
        console.log("Available content types:", contentTypes.items.map(ct => ({
          id: ct.sys.id,
          name: ct.name
        })));
        const response = await contentfulClient.getEntries({
          content_type: 'revealText',
          limit: 1
        });
        console.log("Contentful response status:", response.sys);
        console.log("Total items found:", response.total);
        console.log("Response items:", response.items.length);
        if (response.items.length === 0) {
          console.log("No entries found for content type 'revealText'");
          return null;
        }
        const entry = response.items[0];
        console.log("First entry sys:", entry.sys);
        console.log("First entry fields:", entry.fields);

        // Check if the entry has the 'revealText' field (which it does according to logs)
        if (entry && entry.fields && 'revealText' in entry.fields) {
          const textContent = entry.fields.revealText as string;
          console.log("Found valid text content:", textContent);
          return {
            sys: entry.sys,
            fields: {
              text: textContent // Map to the expected 'text' field in our type
            }
          } as ContentfulRevealText;
        }
        console.log("Entry found but missing expected field, fields available:", Object.keys(entry.fields));
        return null;
      } catch (err) {
        console.error("Error fetching from Contentful:", err);
        throw err;
      }
    }
  });

  useEffect(() => {
    console.log("Current revealTextContent:", revealTextContent);
    const text = textRef.current;
    if (!text) return;

    // Get the text content
    const originalText = text.textContent || "";

    // Split text into words
    const words = originalText.split(" ");

    // Create HTML structure with words and characters wrapped in spans
    const formattedHTML = words.map(word => {
      // Update the character spans to have display: inline-block and padding-bottom
      const charSpans = word.split("").map(char => 
        `<span class="char" style="display: inline-block; padding-bottom: 0.2em;">${char}</span>`
      ).join("");
      return `<div class="word" style="display: inline-block; margin-right: 0.25em;">${charSpans}</div>`;
    }).join("");
    
    text.innerHTML = formattedHTML;
    
    // Short delay to ensure everything is rendered properly, especially important for iOS
    setTimeout(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: text,
          start: "top bottom-=66.7vh", // Updated to start when element is 2/3rds up the viewport
          end: "bottom center",
          scrub: 0.5,
          markers: false
        }
      });
      
      const spans = text.querySelectorAll(".char");
      console.log(`Found ${spans.length} spans to animate`);
      
      // For iOS devices, we'll use opacity instead of color: transparent
      // This approach works better with the webkit text fill and background clip properties
      if (isIOS) {
        spans.forEach((span, i) => {
          tl.to(span, {
            opacity: 0,
            ease: "power1.inOut",
            duration: 0.1
          }, i * 0.01);
        });
      } else {
        // For non-iOS devices, keep the original animation
        spans.forEach((span, i) => {
          tl.to(span, {
            color: "transparent", 
            ease: "power1.inOut",
            duration: 0.1
          }, i * 0.01);
        });
      }
    }, isIOS ? 300 : 0); // Add delay for iOS devices
    
    return () => {
      // Make sure to kill all GSAP animations and ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [revealTextContent, isIOS]);

  // Apply iOS-specific styling to the text container
  const getTextStyles = () => {
    // Base styles
    const baseStyles = {
      background: "linear-gradient(90deg, #FFB577 0%, #FFB577 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      lineHeight: "1.2",
      whiteSpace: "pre-wrap" as const,
      wordBreak: "normal" as const,
      WebkitFontSmoothing: "antialiased",
      textRendering: "optimizeLegibility" as React.CSSProperties["textRendering"]
    };

    // Add iOS-specific styles
    if (isIOS) {
      return {
        ...baseStyles,
        WebkitTextFillColor: "transparent", // Critical for iOS text masking
        color: colors.coral,                // Fallback color
      };
    }

    return baseStyles;
  };

  if (isLoading) {
    return <div className="w-full py-24" style={{
      backgroundColor: colors.darkGreen
    }}>
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-9 h-32 animate-pulse bg-gray-800/50 rounded" />
        </div>
      </div>;
  }
  
  if (error) {
    console.error("Error loading reveal text:", error);
  }

  return <>
      <div className="w-full py-24" style={{
      backgroundColor: colors.darkGreen
    }}>
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div 
            ref={textRef} 
            style={getTextStyles()}
            className="title-md text-roseWhite col-span-12 md:col-span-9 mb-8 py-[12px]"
            data-ios={isIOS ? "true" : "false"}
          >
            {revealTextContent?.fields.text || "Default reveal text"}
          </div>
          <div className="col-span-12 md:col-span-9">
            <Button variant="default" className="h-[48px] rounded-full bg-coral text-black hover:bg-coral/90" onClick={() => setIsFormOpen(true)}>
              STAY IN THE LOOP
            </Button>
          </div>
        </div>
      </div>
      
      <Form open={isFormOpen} onClose={() => setIsFormOpen(false)} title="Curious?<br>Sign up to hear about upcoming events and membership offerings." hubspotPortalId={HUBSPOT_PORTAL_ID} hubspotFormId={HUBSPOT_FORM_ID} />
    </>;
};

export default RevealText;
