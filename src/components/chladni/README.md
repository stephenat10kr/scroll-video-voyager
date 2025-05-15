
# Chladni ScrollJack

A React component package that combines a beautiful Chladni pattern background with smooth scrolljacking functionality.

## Installation

1. Copy the entire `chladni` directory to your project
2. Make sure you have these dependencies:
   - React 18+
   - Tailwind CSS

## Basic Usage

```tsx
import { ChladniScrollJack, Section } from './chladni';

const YourPage = () => {
  return (
    <ChladniScrollJack titles={["First Section", "Second Section", "Third Section"]}>
      {/* Section 1 */}
      <Section>
        <h2 className="text-3xl font-bold text-white mb-6">First Section Content</h2>
        <p className="text-white text-xl">Your content here...</p>
      </Section>
      
      {/* Section 2 */}
      <Section>
        <h2 className="text-3xl font-bold text-white mb-6">Second Section Content</h2>
        <p className="text-white text-xl">More content here...</p>
      </Section>
      
      {/* Section 3 */}
      <Section>
        <h2 className="text-3xl font-bold text-white mb-6">Third Section Content</h2>
        <p className="text-white text-xl">Final content here...</p>
      </Section>
    </ChladniScrollJack>
  );
};
```

## Components

### ChladniScrollJack

The main component that combines the Chladni pattern background with scrolljacking behavior.

**Props:**
- `children`: React nodes to render as sections
- `titles`: Optional array of strings for section titles

### Section

A pre-styled section component for use within ChladniScrollJack.

**Props:**
- `children`: React nodes to render within the section
- `className`: Optional additional CSS classes

### ChladniPattern

Just the animated background pattern without scrolljacking behavior.

**Props:**
- `children`: React nodes to render on top of the background

## Advanced Usage

### Using Just the Chladni Background

If you only want the animated background without scrolljacking:

```tsx
import { ChladniPattern } from './chladni';

const YourPage = () => {
  return (
    <ChladniPattern>
      {/* Your regular content here */}
      <div className="container mx-auto py-20 px-4 min-h-screen">
        <h1 className="text-5xl font-bold mb-8 text-white">Your Content</h1>
        <p className="text-xl text-white">
          This will have the animated background without scrolljacking behavior.
        </p>
      </div>
    </ChladniPattern>
  );
};
```

### Styling Tips

- The background is black with white patterns
- Use text colors that contrast well (white works best)
- Add `backdrop-blur-sm` and background with opacity (like `bg-black/30`) to make content more readable
- All components are responsive by default

## Customization

To customize the Chladni pattern:
- Edit the shader parameters in `src/components/ChladniPattern.tsx`
- Main visual parameters are in the `s1` and `s2` vectors
