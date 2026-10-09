import { describe, expect, it } from 'vitest'
import { postmark } from '../app/utils/format'

describe('postmark', () => {
  it('splits an ISO date into day, Spanish month abbreviation and year', () => {
    expect(postmark('2020-03-09')).toEqual({ day: '9', month: 'MAR', year: '2020' })
  })

  it('does not shift the day with the local timezone', () => {
    expect(postmark('2021-01-01').day).toBe('1')
    expect(postmark('2021-12-31')).toEqual({ day: '31', month: 'DIC', year: '2021' })
  })

  it('returns the raw text for an unparseable date', () => {
    expect(postmark('soon')).toEqual({ day: '', month: 'soon', year: '' })
  })
})
