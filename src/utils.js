const Color = require('color')

function kebabCase(string) {
  return string
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/\s+/g, '-')
  .toLowerCase()
}

function tailwindVariableHelper(name) {
  return function({ opacityVariable, opacityValue } = {}) {
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
  prefix = [],
  flattened = {}
) {
  return Object
    .entries(obj)
    .reduce((acc, [key, value]) => {
      if (typeof value === 'object') {
        flatten(value, transformKeyCallback, [...prefix, key], acc)
      } else {
        flattened[transformKeyCallback([...prefix, key])] = value
      }
      return acc
    }, flattened)
}

const getTailwindKeyName = keys =>
  keys.filter(key => key !== 'default').map(kebabCase).join('-')

function hasAlpha(color) {
  return (
    color.startsWith('rgba(') ||
    color.startsWith('hsla(') ||
    (color.startsWith('#') && color.length === 9) ||
    (color.startsWith('#') && color.length === 5)
  )
}

function toRgba(color) {
  try {
    const [ r, g, b, a ] = Color(color).rgb().array()
    return [ r, g, b, a === undefined && hasAlpha(color) ? 1 : a ]
  } catch {
    return false
  }
}

function defaultCustomVarTransformer(key, value) {
  if (key.startsWith('--colors')) {
    const color = toRgba(value)
    if (color) {
      const [ r, g, b ] = color
      return `${r} ${g} ${b}`
    }
  }

  return value
}

function getThemeAsCustomVars(
  tokenValues,
  transformer = defaultCustomVarTransformer
) {
  return Object
  .entries(flatten(tokenValues, keys => `--${getTailwindKeyName(keys)}`))
  .reduce(function(props, [ key, value ]) {
    return {
      ...props,
      [key]: transformer(key, value)
    }
  }, {})
}

function resolveThemeConfig(
  tokenValue,
  previousKey = []
) {
  return Object
    .entries(tokenValue)
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === "object"
        ? resolveThemeConfig(value, [ ...previousKey, key ])
        : toRgba(value)
          ? tailwindVariableHelper(getTailwindKeyName([...previousKey, key]))
          : `var(--${getTailwindKeyName([ ...previousKey, key ])}, ${value})`
    }), {})
}

module.exports.flatten = flatten
module.exports.getTailwindKeyName = getTailwindKeyName
module.exports.tailwindVariableHelper = tailwindVariableHelper
module.exports.getThemeAsCustomVars = getThemeAsCustomVars
module.exports.resolveThemeConfig = resolveThemeConfig
