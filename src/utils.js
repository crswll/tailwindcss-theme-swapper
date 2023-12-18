const Color = require('color')
const colorConfigKeys = [
  'backgroundColor',
  'borderColor',
  'caretColor',
  'colors',
  'divideColor',
  'fill',
  'gradientColorStops',
  'placeholderColor',
  'ringColor',
  'ringOffsetColor',
  'stroke',
  'textColor',
]

function kebabCase (string) {
  return string
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/\s+/g, '-')
  .toLowerCase()
}

function tailwindVariableHelper (name) {
  return function ({ opacityVariable, opacityValue } = {}) {
    if (opacityValue !== undefined) {
      return `rgb(var(--${name}) / ${opacityValue})`
    }
    if (opacityVariable !== undefined) {
      return `rgb(var(--${name}) / var(${opacityVariable}, 1))`
    }
    return `rgb(var(--${name}))`
  }
}

function flatten (
  obj,
  transformKeyCallback = key => key.join('.'),
  transformValueCallback = (keys, value) => value,
  previousKeys = [],
  flattened = {}
) {
  return Object
    .entries(obj)
    .reduce((acc, [key, value]) => {
      const keyPath = [...previousKeys, key]

      if (typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, transformKeyCallback, transformValueCallback, keyPath, acc)
      } else {
        flattened[transformKeyCallback(keyPath)] = transformValueCallback(keyPath, value)
      }
      return acc
    }, flattened)
}

const getTailwindKeyName = keys =>
  keys.filter(key => key.toLowerCase() !== 'default').map(kebabCase).join('-')

function toRgba (color) {
  try {
    const [ r, g, b ] = Color(color).rgb().array()
    return [ r, g, b ]
  } catch {
    return null
  }
}

function defaultCustomPropValueTransformer (keys, value) {
  if (colorConfigKeys.includes(keys[0])) {
    const color = toRgba(value)
    if (color) {
      const [ r, g, b ] = color
      return `${r} ${g} ${b}`
    }
  }

  if (keys[0] === 'fontSize' && typeof value !== 'string') {
    return value[0]
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value
}

function defaultConfigValueTransformer (keys, value) {
  if (colorConfigKeys.includes(keys[0])) {
    if (toRgba(value)) {
      return tailwindVariableHelper(getTailwindKeyName(keys))
    }
  }

  if (keys[0] === 'fontSize' && typeof value === 'object') {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`tailwindcss-theme-swapper: Only using the font size defined at ${keys.join('.')}. Support for this may come if enough people complain about it.`)
    }

    return `var(--${getTailwindKeyName(keys)}, ${value[0]})`
  }

  return `var(--${getTailwindKeyName(keys)}, ${value})`
}


function getThemeAsCustomProps (
  tokenValues,
  transformer = defaultCustomPropValueTransformer
) {
  return flatten(
    tokenValues,
    keys => `--${getTailwindKeyName(keys)}`,
    transformer
  )
}


function resolveThemeConfig (
  tokenValue,
  previousKeys = [],
  valueTransformer = defaultConfigValueTransformer
) {
  return Object
    .entries(tokenValue)
    .reduce((acc, [key, value]) => {
      const keyPath = [ ...previousKeys, key ]
      return {
        ...acc,
        [key]: typeof value === 'object' && !Array.isArray(value)
          ? resolveThemeConfig(value, keyPath)
          : valueTransformer(keyPath, value)
      }
    }, {})
}

module.exports.defaultConfigValueTransformer = defaultConfigValueTransformer
module.exports.defaultCustomPropValueTransformer = defaultCustomPropValueTransformer
module.exports.flatten = flatten
module.exports.getTailwindKeyName = getTailwindKeyName
module.exports.getThemeAsCustomProps = getThemeAsCustomProps
module.exports.resolveThemeConfig = resolveThemeConfig
module.exports.tailwindVariableHelper = tailwindVariableHelper
module.exports.toRgba = toRgba
