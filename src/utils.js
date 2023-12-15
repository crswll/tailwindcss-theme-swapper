const colorConfigKeys = [
  'accentColor',
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

function defaultCustomPropValueTransformer (keys, value) {
  if (colorConfigKeys.includes(keys[0])) {
    return `color-mix(in srgb, ${value}, transparent calc(100% - 100% * <alpha-value>))`
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value
}

function defaultConfigValueTransformer (keys, value) {
  return `var(--${getTailwindKeyName(keys)})`
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
        [key]: typeof value === "object"
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
module.exports.colorConfigKeys = colorConfigKeys
