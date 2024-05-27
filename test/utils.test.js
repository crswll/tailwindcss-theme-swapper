const {
  tailwindConfigValueTransformer,
  toCustomPropertyValue,
  flatten,
  getTailwindKeyName,
  getThemeAsCustomProps,
  resolveThemeConfig,
} = require('../src/utils')

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
      spacing: {
        5: '500px',
        5.5: '550px',
      },
      fontFamily: {
        foo: ['a', 'b', '"C 4"'],
      },
    })

    expect(result).toEqual({
      '--colors-red': '#f00',
      '--colors-hot': 'hotpink',
      '--colors-primary': '#444',
      '--background-color-test': '#444',
      '--text-color-test': '#444',
      '--border-color-test': '#444',
      '--ring-color-test': '#444',
      '--font-size-base': '16px',
      '--border-radius': '5px',
      '--spacing-5': '500px',
      '--spacing-5_5': '550px',
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
        spacing: {
          5: '500px',
          5.5: '550px',
        },
      })

      expect(result).toEqual({
        colors: {
          red: "color-mix(in srgb, var(--colors-red) calc(100% * <alpha-value>), transparent)",
          primary: {
            default: "color-mix(in srgb, var(--colors-primary) calc(100% * <alpha-value>), transparent)",
            darker: "color-mix(in srgb, var(--colors-primary-darker) calc(100% * <alpha-value>), transparent)",
          },
        },
        fontSize: {
          base: 'var(--font-size-base)',
        },
        spacing: {
          5: 'var(--spacing-5)',
          5.5: 'var(--spacing-5_5)',
        }
      })
    })
  })

  describe('defaultCustomVarTransformer', () => {
    test('should return a joined string when array', () => {
      expect(toCustomPropertyValue(['fontFamily'], [1, 2, 3])).toEqual('1, 2, 3')
    })

    test('should just return the value when it is not a color', () => {
      expect(toCustomPropertyValue(['fontSize'], '16px')).toEqual('16px')
      expect(toCustomPropertyValue(['fontSize'], ['16px', '1'])).toEqual('16px')
    })
  })

  describe('tailwindConfigValueTransformer', () => {
    test('should return a joined string when an array', () => {
      expect(tailwindConfigValueTransformer(['fontFamily', 'sans'], ['font a', 'font b'])).toEqual('var(--font-family-sans)')
    })

    test('should just use the font-size when using a more complex value for fontSize', () => {
      expect(tailwindConfigValueTransformer(['fontSize', 'complex'], ['24px', { lineHeight: '1.2' }])).toEqual('var(--font-size-complex)')
      expect(tailwindConfigValueTransformer(['fontSize', 'complex'], ['22px', '1.2'])).toEqual('var(--font-size-complex)')
    })

    test('should just return the value when it is not a color', () => {
      expect(tailwindConfigValueTransformer(['colors', 'primary'], 'rgb(255, 0, 0)')).toEqual('color-mix(in srgb, var(--colors-primary) calc(100% * <alpha-value>), transparent)')
      expect(tailwindConfigValueTransformer(['fontSize'], '16px')).toEqual('var(--font-size)')
    })
  })
})
