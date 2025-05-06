import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import type { ContentfulRevealText } from "@/types/contentful";
gsap.registerPlugin(ScrollTrigger, TextPlugin);
const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);
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
      const charSpans = word.split("").map(char => `<span class="char">${char}</span>`).join("");
      return `<div class="word" style="display: inline-block; margin-right: 0.25em;">${charSpans}</div>`;
    }).join("");
    text.innerHTML = formattedHTML;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: text,
        start: "top bottom-=100",
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
    return <div className="w-full bg-black py-24">
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-9 h-32 animate-pulse bg-gray-800 rounded" />
        </div>
      </div>;
  }
  if (error) {
    console.error("Error loading reveal text:", error);
  }
  return <div className="w-full py-24 bg-[#203435]">
      <div className="grid grid-cols-12 max-w-[90%] mx-auto">
        <div ref={textRef} className="text-white font-gt-super text-7xl col-span-9 mb-8" style={{
        background: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        lineHeight: "1.2",
        whiteSpace: "pre-wrap",
        wordBreak: "normal"
      }}>
          {revealTextContent?.fields.text || "Default reveal text"}
        </div>
        <div className="col-span-9">
          <Button variant="default" className="h-[48px] rounded-full bg-white text-black hover:bg-white/90">
            STAY IN THE LOOP
          </Button>
        </div>
      </div>
    </div>;
};
export default RevealText;