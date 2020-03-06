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

  test('should glatten with callback', () => {
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
    })

    expect(result).toEqual({
      '--colors-red': '#f00',
      '--colors-primary': '#444',
      '--colors-primary-darker': '#000',
      '--fontSize-base': '16px',
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
          base: 'var(--fontSize-base, 1rem)',
        },
      })
    })
  })
})
