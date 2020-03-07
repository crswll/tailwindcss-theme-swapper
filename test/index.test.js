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
    primary: {
      default: '#f00',
      darker: '#400',
    },
  },
  spacing: {
    'fart': '69px',
  },
  borderRadius: {
    default: '5px',
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
  themes: [
    {
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
    `@tailwind base;`,
    { from: undefined }
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
          "hotpink": "var(--colors-hotpink, hotpink)",
        },
        "spacing": {
          "fart": "var(--spacing-fart, 69px)",
        },
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
        --colors-primary: #f00;
        --colors-primary-darker: #400;
        --spacing-fart: 69px;
        --border-radius: 5px
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --colors-primary: #fff;
          --colors-primary-darker: #aaa
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
