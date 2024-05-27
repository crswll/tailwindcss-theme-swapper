const postcss = require('postcss')
const tailwindcss = require('tailwindcss')
const cssMatcher = require('jest-matcher-css')
const resolveConfig = require('tailwindcss/resolveConfig')
const tokenPlugin = require('../src')

expect.extend({
  toMatchCss: cssMatcher,
})

const defaultTheme = {
  colors: {
    hotpink: 'hotpink',
    'with-opacity': 'rgba(255, 0, 0, 0.5)',
    primary: {
      default: '#f00',
      darker: '#400',
    },
  },
  spacing: {
    'fart': '69px',
    '5.5': '550px',
  },
  borderRadius: {
    default: '5px',
  },
  fontFamily: {
    sans: ['Font A', 'Font B', 'Font C']
  },
  fontSize: {
    sm: '12px',
    complex: ['22px', { lineHeight: '1.2rem' }]
  },
}

const darkTheme = {
  colors: {
    primary: {
      default: '#fff',
      darker: '#aaa',
    },
  },
}

const themeSwapperOptions = {
  themes: [{
    name: 'base',
    selectors: [':root', '.light'],
    theme: defaultTheme,
  },
  {
    name: 'dark',
    mediaQuery: '@media (prefers-color-scheme: dark)',
    theme: darkTheme,
  },
],
}

const getPluginCss = (tailwindConfig = {}) =>
postcss(tailwindcss({
  corePlugins: false,
  ...tailwindConfig,
}))
.process(
  `@tailwind base;`, { from: undefined }
  )
  .then(({ css }) => css)

  describe('config extending', () => {
    const resolvedConfig = resolveConfig({
      plugins: [
        tokenPlugin(themeSwapperOptions)
      ],
    })

    test('extend', () => {
      expect(resolvedConfig).toMatchObject({
        "theme": {
          "colors": {
            "with-opacity": "color-mix(in srgb, var(--colors-with-opacity) calc(100% * <alpha-value>), transparent)",
            "hotpink": "color-mix(in srgb, var(--colors-hotpink) calc(100% * <alpha-value>), transparent)",
            "primary": {
              "default": "color-mix(in srgb, var(--colors-primary) calc(100% * <alpha-value>), transparent)",
              "darker": "color-mix(in srgb, var(--colors-primary-darker) calc(100% * <alpha-value>), transparent)",
            }
          },
          "spacing": {
            "fart": "var(--spacing-fart)",
          },
          "fontSize": {
            "sm": "var(--font-size-sm)",
          }
        },
      })
    })
  })

  describe('custom css', () => {
    test('the props should exist', () => {
      const sampleConfig = { plugins: [tokenPlugin(themeSwapperOptions)] }
      const sampleConfigOutput = `
      :root, .light {
        --colors-hotpink: hotpink;
        --colors-with-opacity: rgba(255, 0, 0, 0.5);
        --colors-primary: #f00;
        --colors-primary-darker: #400;
        --spacing-fart: 69px;
        --spacing-5_5: 550px;
        --border-radius: 5px;
        --font-family-sans: Font A, Font B, Font C;
        --font-size-sm: 12px;
        --font-size-complex: 22px;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --colors-primary: #fff;
          --colors-primary-darker: #aaa;
        }
      }
      `
      return getPluginCss(sampleConfig).then(css => {
        expect(css).toMatchCss(sampleConfigOutput)
      })
    })

    test('no options css', () => {
      const configWithoutBaseTheme = {
        plugins: [
          tokenPlugin()
        ]
      }

      const outputWithoutBaseTheme = ''

      return getPluginCss(configWithoutBaseTheme).then(css => {
        expect(css).toMatchCss(outputWithoutBaseTheme)
      })
    })
  })
