
import React, { useEffect, useState } from "react";
import ScrollVideo from "../components/ScrollVideo";
import { contentfulClient } from "../lib/contentfulClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";

const Index = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    let isMounted = true;
    const assetId = "1VGBBPgvLIZXktdboXT0RP";
    
    console.log("Fetching video for platform:", isMobile ? "mobile" : "desktop");
    
    // Fetch video asset directly by ID with improved error handling
    contentfulClient
      .getAsset(assetId)
      .then((asset) => {
        if (!isMounted) return;
        if (asset && asset.fields && asset.fields.file) {
          const { file } = asset.fields;
          console.log("Found video asset:", file);
          
          // Ensure URL always has https protocol
          let url = file.url;
          if (url.startsWith('//')) {
            url = `https:${url}`;
          } else if (!url.startsWith('http')) {
            url = `https://${url}`;
          }
          
          console.log("Formatted video URL:", url);
          setVideoUrl(url);
        } else {
          console.error("Video asset not found or has invalid structure");
          setError("Video asset not found or has invalid structure");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Contentful video fetch error:", err);
        setError(`Error loading video: ${err.message || 'Unknown error'}`);
      });

    // Keep existing entries fetch
    contentfulClient
      .getEntries()
      .then((response) => {
        if (!isMounted) return;
        setEntries(response.items);
        setLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Contentful fetch error:", error);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isMobile]);

  return (
    <div className="bg-black min-h-screen w-full relative">
      {error && (
        <Alert variant="destructive" className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <ScrollVideo src={videoUrl || undefined} />
      
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-gray-900/90 rounded shadow">
        <h2 className="text-white text-xl font-bold mb-4">Contentful Entries</h2>
        {loading ? (
          <div className="text-gray-200">Loading...</div>
        ) : (
          <ul className="space-y-2">
            {entries.length === 0 ? (
              <li className="text-gray-400">No entries found.</li>
            ) : (
              entries.map((item) => (
                <li key={item.sys.id} className="text-gray-100">
                  <pre className="text-xs whitespace-pre-wrap bg-gray-800 rounded p-2">
                    {JSON.stringify(item.fields, null, 2)}
                  </pre>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Index;
