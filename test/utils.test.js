const {
  flatten,
  getTailwindKeyName,
  getThemeAsCustomVars,
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
      '--colors-red': '#f00',
      '--colors-primary': '#444',
      '--colors-primary-darker': '#000',
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
          red: 'var(--colors-red, #f00)',
          primary: {
            default: 'var(--colors-primary, #f00)',
            darker: 'var(--colors-primary-darker, #400)',
          },
        },
        fontSize: {
          base: 'var(--font-size-base, 1rem)',
        },
      })
    })
  })
})
