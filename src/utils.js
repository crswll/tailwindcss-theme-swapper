const kebabCase = string => string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()

const flatten = (
  obj,
  transformKeyCallback = key => key.join('.'),
  prefix = [],
  flattened = {}
) =>
  Object.entries(obj)
    .reduce((acc, [key, value]) => {
      if (typeof value === 'object'){
        flatten(value, transformKeyCallback, [...prefix, key], acc)
      } else {
        flattened[transformKeyCallback([...prefix, key])] = value
      }
      return acc
    }, flattened)


const getTailwindKeyName = keys =>
  keys.filter(key => key.toLowerCase() !== 'default').map(kebabCase).join('-')

const getThemeAsCustomVars = (tokenValues) =>
  flatten(tokenValues, keys => `--${getTailwindKeyName(keys)}`)

const resolveThemeConfig = (tokenValue, previousKey = []) =>
  Object.entries(tokenValue)
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === "object"
        ? resolveThemeConfig(value, [...previousKey, key])
        : `var(--${getTailwindKeyName([...previousKey, key])}, ${value})`
    }), {})

module.exports.flatten = flatten
module.exports.getTailwindKeyName = getTailwindKeyName
module.exports.getThemeAsCustomVars = getThemeAsCustomVars
module.exports.resolveThemeConfig = resolveThemeConfig
