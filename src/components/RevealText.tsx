
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
import { toast } from "@/components/ui/use-toast";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// HubSpot Portal ID and Form ID matching those in Navigation.tsx
const HUBSPOT_PORTAL_ID = "242761887";
const HUBSPOT_FORM_ID = "ed4555d7-c442-473e-8ae1-304ca35edbf0";

const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    data: revealTextContent,
    isLoading,
    error
  } = useQuery({
    queryKey: ['revealText'],
    queryFn: async () => {
      console.log("Fetching reveal text from Contentful");
      try {
        // Directly fetch the specific entry by ID
        const entry = await contentfulClient.getEntry('51n6CyvxFYhNwKPqdihLF9');
        console.log("Contentful entry:", entry);
        
        if (entry && entry.fields) {
          console.log("Found entry fields:", entry.fields);
          
          // Check which field contains the reveal text content
          let revealTextContent = null;
          let bodyTextContent = null;
          
          // Look for the revealText field (for the animated gradient text)
          if ('revealText' in entry.fields) {
            revealTextContent = entry.fields.revealText;
          } else if ('text' in entry.fields && !bodyTextContent) {
            // If no specific revealText field but there's a text field, use it for reveal text
            revealTextContent = entry.fields.text;
          }
          
          // Look for the text field (for the body copy)
          if ('text' in entry.fields) {
            bodyTextContent = entry.fields.text;
          } else if ('bodyText' in entry.fields) {
            bodyTextContent = entry.fields.bodyText;
          }
          
          console.log("Extracted reveal text content:", revealTextContent);
          console.log("Extracted body text content:", bodyTextContent);
          
          if (revealTextContent || bodyTextContent) {
            return {
              sys: entry.sys,
              fields: {
                revealText: revealTextContent || "Default reveal text",
                text: bodyTextContent || "Join our community to receive updates about exclusive experiences, membership opportunities, and special events. Lightning Society is a place where curiosity and connection thrive."
              }
            } as ContentfulRevealText;
          }
        }
        
        console.log("Entry found but missing expected text fields");
        return null;
      } catch (err) {
        console.error("Error fetching from Contentful:", err);
        toast({
          title: "Error loading content",
          description: "Could not load the reveal text content. Please try again later.",
          variant: "destructive"
        });
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
    
    spans.forEach((span, i) => {
      tl.to(span, {
        color: "transparent",
        ease: "power1.inOut",
        duration: 0.1
      }, i * 0.01);
    });
    
    return () => {
      tl.kill();
    };
  }, [revealTextContent]);

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

  // Use the body text from Contentful or fall back to the default
  const bodyText = revealTextContent?.fields.text || "Join our community to receive updates about exclusive experiences, membership opportunities, and special events. Lightning Society is a place where curiosity and connection thrive.";

  return <>
      <div className="w-full py-24" style={{
        backgroundColor: colors.darkGreen
      }}>
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div ref={textRef} style={{
            background: "linear-gradient(90deg, #FFB577 0%, #FFB577 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            lineHeight: "1.2",
            whiteSpace: "pre-wrap",
            wordBreak: "normal",
            WebkitFontSmoothing: "antialiased",
            textRendering: "optimizeLegibility"
          }} className="title-md text-roseWhite col-span-12 md:col-span-9 mb-8 py-[12px]">
            {revealTextContent?.fields.revealText || "Default reveal text"}
          </div>
          <div className="col-span-12 md:col-span-9">
            <Button variant="default" className="h-[48px] rounded-full bg-coral text-black hover:bg-coral/90" onClick={() => setIsFormOpen(true)}>
              STAY IN THE LOOP
            </Button>
            
            {/* Body copy text block in white */}
            <div className="mt-8 body-text text-roseWhite col-span-12 md:col-span-9">
              {bodyText}
            </div>
          </div>
        </div>
      </div>
      
      <Form open={isFormOpen} onClose={() => setIsFormOpen(false)} title="Curious?<br>Sign up to hear about upcoming events and membership offerings." hubspotPortalId={HUBSPOT_PORTAL_ID} hubspotFormId={HUBSPOT_FORM_ID} />
    </>;
};

export default RevealText;
