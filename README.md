# tailwindcss-theme-swapper

**Extend** your tailwind config with CSS Custom Properties and trigger the updating of them with any type of selector or media query.

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

## Try It Out

### Minimal
https://play.tailwindcss.com/Gt21fePNvv

### Fancier (radix colors, multiple themes)
https://play.tailwindcss.com/jskI9McL20

## Usage Example

In your tailwind.config.js:

```js
const themeSwapper = require('tailwindcss-theme-swapper')

module.exports = {
  plugins: [
    themeSwapper({
      themes: [
        // The only required theme is `base`. Every property used in
        // other themes must exist in here.
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

  // Apply one of these selectors(?) to an element and all of its children to use that theme.
  // `<div class="dark">`, `<div data-theme="dark">`, `<div dark>`
  selectors: ['.dark', '[data-theme="dark"]', '[dark]', ],

  // If this media query matches the theme will apply to the entire page.
  mediaQuery: '@media (prefers-color-scheme: dark)',

  // This extends your tailwind theme.
  // Only keys/values defined here will be made into custom properties.
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

## Example I:O

### Themes Input

```js
const themes = [
  {
    name: 'base',
    selectors: [':root'],
    theme: {
      colors: {
        primary: 'hsl(0 100% 50%)',
      },
      spacing: {
        sm: '3px',
      },
    },
  },
  {
    name: 'dark',
    selectors: [
      '.dark',
      '[dark]',
      '[data-theme="dark"]'
    ],
    mediaQuery: '@media (prefers-color-scheme: dark)',
    theme: {
      colors: {
        primary: 'darkslateblue',
      },
    },
  },
  {
    selectors: ['.lime']
    theme: {
      colors: {
        primary: '#0f0',
      },
    },
  },
]
```

### CSS Output

```css
:root {
  --colors-primary: hsl(0 100% 50%);
  --spacing-sm: 3px
}

.dark, [dark], [data-theme="dark"] {
  --colors-primary: darkslateblue
}

@media (prefers-color-scheme: dark) {
  :root{
    --colors-primary: darkslateblue
  }
}

.lime {
  --colors-primary: #0f0
}

/* ... */

.bg-primary {
  --tw-bg-opacity: 1;
  background-color: color-mix(in srgb, var(--colors-primary), transparent calc(100% - 100% * var(--tw-bg-opacity)))
}

.text-primary {
  --tw-text-opacity: 1;
  background-color: color-mix(in srgb, var(--colors-primary), transparent calc(100% - 100% * var(--tw-text-opacity)))
}

.p-sm {
  padding: var(--spacing-sm)
}
```
