# tailwindcss-theme-swapper

Turn parts of your tailwind config into CSS properties to allow for easy theming.

## Requirements

* Tailwind 1.2

## Browser Support

Just needs to support CSS Custom Properties. IE11 can kind of work but only the base theme with something like `postcss-preset-env`.

## Installation

```bash
yarn add tailwindcss-theme-swapper
# or
npm install tailwindcss-theme-swapper --save-dev
```

## Usage Example

In your tailwind.config.js:

```js
const themeSwapper = require('tailwindcss-theme-swapper')

module.exports = {
  plugins: [
    themeSwapper({
      themes: [
        {
          name: 'base',
          selectors: [':root'],
          theme: {
            colors: {
              primary: '#f00',
            },
          },
        },
        {
          name: 'dark',
          selectors: ['.dark'],
          mediaQuery: '@media (prefers-color-scheme: dark)',
          theme: {
            colors: {
              primary: '#fff',
            },
          },
        },
        {
          name: 'matrix',
          selectors: ['.matrix'],
          theme: {
            colors: {
              primary: '#0f0',
            },
          },
        },
      ],
    }),
  ],
}
```

### Theme Swapper Properties

```js
{
  // The name of the theme. You only have to name `base`.
  name: 'dark',

  // Apply one of these selectors(?) for an element and all of its children to use that theme.
  selectors: ['.dark', '[dark]'],

  // If this media query matches the theme will apply to the entire page.
  mediaQuery: '@media (prefers-color-scheme: dark)',

  // This extends the tailwind theme. Only keys/values defined here will be made into custom properties.
  theme: {
    colors: {
      // ...
    },
    spacing: {
      // ...
    },
    borderRadius: {
      // ...
    },
  },
}
```
