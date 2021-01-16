const {
  flatten,
  getTailwindKeyName,
  getThemeAsCustomVars,
  resolveThemeConfig,
  tailwindVariableHelper,
} = require('../src/utils')

describe('getTailwindKeyName', () => {
  test('should return array joined', () => {
    expect(getTailwindKeyName(['foo', 'bar'])).toBe('foo-bar')
  })
  test('default should be removed from the path', () => {
    expect(getTailwindKeyName(['foo', 'default', 'bar'])).toBe('foo-bar')
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

describe('getThemeAsCustomVars', () => {
  test('should flatten to a simple object with custom vars as the keys', () => {
    const result = getThemeAsCustomVars({
      colors: {
        red: '#f00',
        hot: 'hotpink',
        primary: {
          default: '#444',
          darker: '#000',
        },
      },
      fontSize: {
        base: '16px',
      },
      borderRadius: {
        default: '5px',
      },
    })

    expect(result).toEqual({
      '--colors-red': '255 0 0',
      '--colors-hot': '255 105 180',
      '--colors-primary': '68 68 68',
      '--colors-primary-darker': '0 0 0',
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

  describe('tailwindVariableHelper', () => {
    test('should return', () => {
      const result = tailwindVariableHelper('foo')

      expect(result({ opacityValue: '0.3' })).toEqual(`rgb(var(--foo) / 0.3)`)
      expect(result({ opacityVariable: '--tw-foo-bar' })).toEqual(`rgb(var(--foo) / var(--tw-foo-bar, 1))`)
      expect(result()).toEqual(`rgb(var(--foo))`)
    })
  })
})
