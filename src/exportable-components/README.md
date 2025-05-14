
# Exportable Hero Video + Text Components

This directory contains the components needed to implement the scrollable hero video with text overlay.

## Required Dependencies

- gsap
- @tanstack/react-query
- contentful

## How to Use

1. Copy this entire directory to your target project
2. Update the Contentful credentials in contentfulClient.ts
3. Update the hero text IDs in useHeroText.ts to match your Contentful entries
4. Import and use the Video component in your page

Example usage:
```jsx
import Video from './path/to/exportable-components/Video';

const HomePage = () => {
  return (
    <div>
      <Video />
      {/* Rest of your page content */}
    </div>
  );
};
```
