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
  someObject,
  transformKey = (keys, value) => keys.join('.'),
  transformValue = (keys, value) => value,
) {
  const result = {}

  function flat (object, parentKeys) {
    for (const [key, value] of Object.entries(object)) {
      const keyPath = [...parentKeys, key]
      if (typeof value === 'object' && !Array.isArray(value)) {
        flat(value, keyPath)
      } else {
        result[transformKey(keyPath)] = transformValue(keyPath, value)
      }
    }
  }

  flat(someObject, [])

  return result
}

function getTailwindKeyName (keys) {
  return keys.filter(key => key.toLowerCase() !== 'default').map(kebabCase).join('-')
}

function toCustomPropertyValue (keys, value) {
  if (keys[0] === 'fontSize' && typeof value !== 'string') {
    return value[0]
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value
}

function toConfigValue (keys, value) {
  if (
    keys[0] === 'fontSize' &&
    typeof value !== 'string' &&
    process.env.NODE_ENV !== 'test'
  ) {
    console.warn(`tailwindcss-theme-swapper: Only using the font size defined at ${keys.join('.')}. Support for this may come if enough people complain about it.`)
  }

  if (colorConfigKeys.includes(keys[0])) {
    return `color-mix(in srgb, var(--${getTailwindKeyName(keys)}) calc(100% * <alpha-value>), transparent)`
  }

  return `var(--${getTailwindKeyName(keys)})`
}

function getThemeAsCustomProps (themeConfig) {
  return flatten(
    themeConfig,
    keys => `--${getTailwindKeyName(keys)}`,
    toCustomPropertyValue
  )
}


function resolveTailwindThemeConfig (
  themeConfig,
  previousKeys = []
) {
  const config = {}

  for (const [key, value] of Object.entries(themeConfig)) {
    const keyPath = [...previousKeys, key]
    if (typeof value === 'object' && !Array.isArray(value)) {
      config[key] = resolveTailwindThemeConfig(value, keyPath)
    } else {
      config[key] = toConfigValue(keyPath, value)
    }
  }

  return config
}

module.exports.tailwindConfigValueTransformer = toConfigValue
module.exports.toCustomPropertyValue = toCustomPropertyValue
module.exports.flatten = flatten
module.exports.getTailwindKeyName = getTailwindKeyName
module.exports.getThemeAsCustomProps = getThemeAsCustomProps
module.exports.resolveThemeConfig = resolveTailwindThemeConfig
module.exports.colorConfigKeys = colorConfigKeys
