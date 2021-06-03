const {
  defaultConfigValueTransformer,
  defaultCustomPropValueTransformer,
  flatten,
  getTailwindKeyName,
  getThemeAsCustomProps,
  resolveThemeConfig,
  tailwindVariableHelper,
  toRgba,
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
    })

    expect(result).toEqual({
      'foo.bar.baz': 'whoa',
      'not.deep': true,
      'shallow': 2,
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
    })

    expect(result).toEqual({
      '--colors-red': '255 0 0',
      '--colors-hot': '255 105 180',
      '--colors-primary': '68 68 68',
      '--background-color-test': '68 68 68',
      '--text-color-test': '68 68 68',
      '--border-color-test': '68 68 68',
      '--ring-color-test': '68 68 68',
      '--font-size-base': '16px',
      '--border-radius': '5px',
    })
  })

  describe('resolveThemeConfig', () => {
    test('should recusivly set', () => {
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
          red: expect.any(Function),
          primary: {
            default: expect.any(Function),
            darker: expect.any(Function),
          },
        },
        fontSize: {
          base: 'var(--font-size-base, 1rem)',
        },
      })
    })
  })

  describe('toRgba', () => {
    test('should return an array of rgba', () => {
      expect(toRgba('#fff')).toEqual([255, 255, 255, undefined])
      expect(toRgba('#ffff')).toEqual([255, 255, 255, 1])
      expect(toRgba('#fff0')).toEqual([255, 255, 255, 0])
      expect(toRgba('hotpink')).toEqual([255, 105, 180, undefined])
      expect(toRgba('rgb(255, 0, 0)')).toEqual([255, 0, 0, undefined])
      expect(toRgba('rgba(255, 0, 0, 0.5)')).toEqual([255, 0, 0, 0.5])
      expect(toRgba('hsl(0, 100%, 50%)')).toEqual([255, 0, 0, undefined])
      expect(toRgba('hsl(0, 100%, 50%, 0.5)')).toEqual([255, 0, 0, 0.5])
      expect(toRgba('__DEFINITELY_NOT_A_COLOR_NO_WAY_NO_HOW__')).toEqual(null)
    })
  })

  describe('defaultCustomVarTransformer', () => {
    test('should return a string in rgb for colors', () => {
      expect(defaultCustomPropValueTransformer(['colors'], 'rgb(255, 0, 0)')).toEqual('255 0 0')
      expect(defaultCustomPropValueTransformer(['backgroundColor'], 'rgb(255, 0, 0)')).toEqual('255 0 0')
      expect(defaultCustomPropValueTransformer(['borderColor'], 'rgb(255, 0, 0)')).toEqual('255 0 0')
      expect(defaultCustomPropValueTransformer(['textColor'], 'rgb(255, 0, 0)')).toEqual('255 0 0')
    })

    test('should just return the value when it is not a color', () => {
      expect(defaultCustomPropValueTransformer(['fontSize'], '16px')).toEqual('16px')
    })
  })

  describe('defaultConfigValueTransformer', () => {
    test('should return a string in rgb for color type configs', () => {
      expect(defaultConfigValueTransformer(['colors', 'primary'], 'rgb(255, 0, 0)')({ opacityVariable: '--bg-opacity' })).toEqual('rgb(var(--colors-primary) / var(--bg-opacity, 1))')
      expect(defaultConfigValueTransformer(['colors', 'primary'], 'rgb(255, 0, 0)')({ opacityValue: '0.2' })).toEqual('rgb(var(--colors-primary) / 0.2)')
      expect(defaultConfigValueTransformer(['colors', 'primary'], 'rgb(255, 0, 0)')()).toEqual('rgb(var(--colors-primary))')
    })

    test('should just return the value when it is not a color', () => {
      expect(defaultConfigValueTransformer(['fontSize'], '16px')).toEqual('var(--font-size, 16px)')
    })
  })

  describe('tailwindVariableHelper', () => {
    test('should return', () => {
      const result = tailwindVariableHelper('foo')

      expect(result({ opacityValue: '0.3' })).toEqual(`rgb(var(--foo) / 0.3)`)
      expect(result({ opacityVariable: '--tw-foo-bar' })).toEqual(`rgb(var(--foo) / var(--tw-foo-bar, 1))`)
      expect(result()).toEqual(`rgb(var(--foo))`)
    })
  })
})
