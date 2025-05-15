
# RevealText Component

A reusable component that displays text with a scrolling reveal animation effect and a call-to-action button that opens a form modal.

## Features

- Text that reveals and disappears as the user scrolls
- GSAP-powered animations
- Optional Contentful integration for content management
- Optional HubSpot form integration for submissions
- Fully customizable styling

## Installation

This component requires the following dependencies:

```bash
npm install gsap @tanstack/react-query contentful react-hook-form
```

Additionally, it depends on some shadcn/ui components:

- Button
- Input
- Sheet, SheetContent, SheetHeader
- toast/sonner

## Usage

### Basic Usage

```jsx
import RevealText from './path/to/exportable-components/RevealText';

const MyPage = () => {
  return (
    <RevealText
      defaultText="Your reveal text goes here. This will animate as users scroll."
      buttonText="CLICK ME"
      formTitle="Sign Up Form"
    />
  );
};
```

### With Contentful Integration

```jsx
import RevealText from './path/to/exportable-components/RevealText';

const MyPage = () => {
  return (
    <RevealText
      contentfulSpaceId="your-contentful-space-id"
      contentfulAccessToken="your-contentful-access-token"
      contentType="revealText" // Content type in Contentful
      defaultText="Fallback text if Contentful fails"
    />
  );
};
```

### With HubSpot Integration

```jsx
import RevealText from './path/to/exportable-components/RevealText';

const MyPage = () => {
  return (
    <RevealText
      defaultText="Your reveal text goes here."
      hubspotPortalId="your-hubspot-portal-id"
      hubspotFormId="your-hubspot-form-id"
      formTitle="Subscribe to our newsletter"
    />
  );
};
```

### Custom Styling

```jsx
import RevealText from './path/to/exportable-components/RevealText';

const MyPage = () => {
  return (
    <RevealText
      defaultText="Your reveal text goes here."
      backgroundColor="#000000"
      textColor="#ffffff"
      textGradient="linear-gradient(90deg, #ff0000 0%, #00ff00 100%)"
      buttonClassName="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
    />
  );
};
```

## Props

| Prop                  | Type     | Default                                        | Description                                     |
|-----------------------|----------|------------------------------------------------|-------------------------------------------------|
| contentfulSpaceId     | string   | undefined                                      | Contentful space ID                             |
| contentfulAccessToken | string   | undefined                                      | Contentful access token                         |
| contentfulEntryId     | string   | undefined                                      | Specific Contentful entry ID (optional)         |
| contentType           | string   | 'revealText'                                   | Contentful content type                         |
| defaultText           | string   | 'Default reveal text'                          | Fallback text if Contentful fails               |
| buttonText            | string   | 'STAY IN THE LOOP'                             | Text for the call-to-action button              |
| buttonClassName       | string   | 'h-[48px] rounded-full bg-coral text-black...' | CSS classes for the button                      |
| formTitle             | string   | 'Curious?<br>Sign up...'                       | Title for the form modal (supports HTML)        |
| hubspotPortalId       | string   | undefined                                      | HubSpot portal ID                               |
| hubspotFormId         | string   | undefined                                      | HubSpot form ID                                 |
| backgroundColor       | string   | '#203435'                                      | Background color for the component              |
| textColor             | string   | '#FFF4F1'                                      | Text color                                      |
| textGradient          | string   | 'linear-gradient(90deg, #FFB577 0%, #FFB577...'| Text gradient (applied with background-clip)    |

## Contentful Setup

The component expects a content type in Contentful with the following field:

- `revealText` (Text field): The text that will be animated

## HubSpot Setup

The component integrates with HubSpot forms API and maps the following fields:

- firstName
- lastName  
- email

