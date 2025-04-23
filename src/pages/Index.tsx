
import React, { useEffect, useState } from "react";
import ScrollVideo from "../components/ScrollVideo";
import { contentfulClient } from "../lib/contentfulClient";

const Index = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    contentfulClient
      .getAssets({
        'mimetype_group': 'video',
        'fields.file.fileName': 'HeroTest_1-720-6KeyFrame.mp4' // Specify the exact filename
      })
      .then((response) => {
        if (!isMounted) return;
        if (response.items.length > 0) {
          const { file } = response.items[0].fields;
          setVideoUrl(file.url.startsWith('https://') ? file.url : `https:${file.url}`);
        } else {
          console.error("No video found with the specified filename");
        }
      })
      .catch((err) => {
        console.error("Contentful video fetch error:", err);
      });

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
  }, []);

  return (
    <div className="bg-black min-h-screen w-full relative">
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
