# tailwindcss-theme-swapper

**Extend** your tailwind config with CSS Custom Properties and trigger the updating of them with any type of selector or media query.

## Requirements

* Tailwind 1.2

## Browser Support

Just needs to support CSS Custom Properties. IE11 can kind of work but only the base theme with something like `postcss-preset-env`.

## Installation

```bash
yarn add crswll/tailwindcss-theme-swapper
# or
npm install crswll/tailwindcss-theme-swapper --save-dev
```

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
  // `<div class="dark">`, `<div dat-theme="dark">`, `<div dark>`
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
        text: '#222',
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
        base: '#ddd',
      },
    },
  },
  {
    name: 'high-contrast',
    mediaQuery: '@media (prefers-contrast: high)',
    theme: {
      colors: {
        base: '#ddd',
      },
    },
  },
]
```

### CSS Output

```css
:root {
  --base: #222
}

@media (prefers-color-scheme: dark) {
  :root {
    --base: #ddd
  }
}

.dark, [dark], [data-theme="dark"] {
  :root {
    --base: #ddd
  }
}

@media (prefers-contrast: high) {
  :root {
    --base: #fff
  }
}

...

.text-base { color: var(--base, #222) }
.bg-base { background-color: var(--base, #222) }
.border-base { border-color: var(--base, #222)}
```
