const {
  defaultConfigValueTransformer,
  defaultCustomPropValueTransformer,
  flatten,
  getTailwindKeyName,
  getThemeAsCustomProps,
  resolveThemeConfig,
  colorConfigKeys
} = require('../src/utils')

const getValueColorMixed = color => `color-mix(in srgb, ${color}, transparent calc(100% - 100% * <alpha-value>))`

describe('getTailwindKeyName', () => {
  test('should return array joined', () => {
    expect(getTailwindKeyName(['foo', 'bar'])).toBe('foo-bar')
  })

  test('default should be removed from the path', () => {
    expect(getTailwindKeyName(['foo', 'default', 'bar'])).toBe('foo-bar')
  })

  test('DEFAULT should be removed from the path', () => {
    expect(getTailwindKeyName(['foo', 'DEFAULT', 'bar'])).toBe('foo-bar')
  })
})

describe('flatten', () => {
  test('should flatten', () => {
    const result = flatten({
      foo: {
        bar: {
          baz: 'whoa',
        },
      },
      not: {
        deep: true,
      },
      shallow: 2,
      list: [1, 2],
    })

    expect(result).toEqual({
      'foo.bar.baz': 'whoa',
      'not.deep': true,
      'shallow': 2,
      'list': [1, 2],
    })
  })

  test('should flatten with callback', () => {
    const result = flatten({
      foo: {
        bar: {
          baz: 1,
        },
      },
    }, keys => keys.join('---'))

    expect(result).toEqual({
      'foo---bar---baz': 1,
    })
  })

  test('should flatten with callback', () => {
    const result = flatten({
      borderRadius: {
        default: 1,
      },
    }, keys => `--${getTailwindKeyName(keys)}`)

    expect(result).toEqual({
      '--border-radius': 1,
    })
  })
})

describe('getThemeAsCustomProps', () => {
  test('should flatten to a simple object with custom props as the keys', () => {
    const result = getThemeAsCustomProps({
      colors: {
        red: '#f00',
        hot: 'hotpink',
        primary: {
          default: '#444',
        },
      },
      textColor: { test: '#444' },
      backgroundColor: { test: '#444' },
      borderColor: { test: '#444' },
      ringColor: { test: '#444' },
      fontSize: { base: '16px' },
      borderRadius: { default: '5px' },
      fontFamily: { foo: ['a', 'b', '"C 4"'] },
    })

    expect(result).toEqual({
      '--colors-red': getValueColorMixed('#f00'),
      '--colors-hot': getValueColorMixed('hotpink'),
      '--colors-primary': getValueColorMixed('#444'),
      '--background-color-test': getValueColorMixed('#444'),
      '--text-color-test': getValueColorMixed('#444'),
      '--border-color-test': getValueColorMixed('#444'),
      '--ring-color-test': getValueColorMixed('#444'),
      '--font-size-base': '16px',
      '--border-radius': '5px',
      '--font-family-foo': 'a, b, "C 4"',
    })
  })

  describe('resolveThemeConfig', () => {
    test('should recursively set', () => {
      const result = resolveThemeConfig({
        colors: {
          red: '#f00',
          primary: {
            default: '#f00',
            darker: '#400',
          }
        },
        fontSize: {
          base: '1rem',
        },
      })

      expect(result).toEqual({
        colors: {
          red: "var(--colors-red)",
          primary: {
            default: "var(--colors-primary)",
            darker: "var(--colors-primary-darker)",
          },
        },
        fontSize: {
          base: 'var(--font-size-base)',
        },
      })
    })
  })

  describe('defaultCustomVarTransformer', () => {
    test.each(colorConfigKeys)('defaultCustomPropValue handles property %s properly', property => {
      expect(defaultCustomPropValueTransformer([property], 'cornflowerblue'))
        .toEqual(getValueColorMixed('cornflowerblue'))
    })

    test('should just return the value when it is not a color', () => {
      expect(defaultCustomPropValueTransformer(['fontSize'], '16px')).toEqual('16px')
    })
  })

  describe('defaultConfigValueTransformer', () => {

    test('should just return the value when it is not a color', () => {
      expect(defaultConfigValueTransformer(['colors', 'primary'], 'rgb(255, 0, 0)')).toEqual('var(--colors-primary)')
      expect(defaultConfigValueTransformer(['fontSize'], '16px')).toEqual('var(--font-size)')
    })
  })
})
