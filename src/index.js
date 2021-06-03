const plugin = require('tailwindcss/plugin')
const { getThemeAsCustomProps, resolveThemeConfig } = require('./utils')

const defaultOptions = {
  themes: [],
}

const themeSwap = (options = defaultOptions) => ({ addBase }) => {
  const { themes } = options

  themes.forEach(themeConfig => {
    const { theme, mediaQuery, selectors = [] } = themeConfig

    if (selectors.length > 0) {
      addBase({
        [selectors.join(', ')]: getThemeAsCustomProps(theme)
      })
    }

    if (mediaQuery) {
      addBase({
        [mediaQuery]: {
          ':root': getThemeAsCustomProps(theme),
        }
      })
    }
  })
}

module.exports = plugin.withOptions(
  themeSwap,
  (options = defaultOptions) => {
    const baseTheme = options
      .themes
      .find(theme => theme.name === 'base')

    return {
      theme: {
        extend: baseTheme && baseTheme.theme
          ? resolveThemeConfig(baseTheme.theme)
          : {}
      }
    }
  }
)
