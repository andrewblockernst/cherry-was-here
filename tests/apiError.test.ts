import { describe, expect, it } from 'vitest'
import { apiError } from '../app/utils/api'

describe('apiError', () => {
  it('uses the { error } string from our API', () => {
    expect(apiError({ data: { error: 'invalid email or password' } })).toBe('invalid email or password')
  })

  it('ignores h3 `error: true` and shows the real message', () => {
    expect(apiError({ data: { error: true, statusCode: 500, message: 'boom' } })).toBe('boom')
  })

  it('joins field errors', () => {
    expect(apiError({ data: { errors: { name: ['required'] } } })).toBe('name: required')
  })
})
