import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './axiosClient';

function axiosError(response?: { data?: unknown }) {
  return Object.assign(new Error('Request failed'), {
    isAxiosError: true,
    response,
  });
}

describe('getApiErrorMessage', () => {
  it('returns a backend string message', () => {
    expect(getApiErrorMessage(axiosError({ data: { message: 'Invalid credentials' } }), 'Fallback'))
      .toBe('Invalid credentials');
  });

  it('joins backend validation messages', () => {
    expect(getApiErrorMessage(axiosError({ data: { message: ['Email is invalid', 'Password is required'] } }), 'Fallback'))
      .toBe('Email is invalid Password is required');
  });

  it('distinguishes a network failure from an HTTP failure', () => {
    expect(getApiErrorMessage(axiosError(), 'Fallback')).toContain('Unable to reach the server');
    expect(getApiErrorMessage(axiosError({ data: {} }), 'Fallback')).toBe('Fallback');
  });

  it('uses the fallback for non-Axios errors', () => {
    expect(getApiErrorMessage(new Error('Unexpected'), 'Fallback')).toBe('Fallback');
  });
});
