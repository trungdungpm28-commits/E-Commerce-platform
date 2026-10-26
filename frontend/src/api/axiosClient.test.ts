import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './axiosClient';

function axiosError(response?: { data?: unknown; status?: number }) {
  return Object.assign(new Error('Request failed'), {
    isAxiosError: true,
    response,
  });
}

describe('getApiErrorMessage', () => {
  it('returns a backend string message', () => {
    expect(getApiErrorMessage(axiosError({ status: 400, data: { message: 'Invalid credentials' } }), 'Fallback'))
      .toBe('Invalid credentials');
  });

  it('joins backend validation messages', () => {
    expect(getApiErrorMessage(axiosError({
      status: 400,
      data: { message: ['Email is invalid', 'Password is required'] },
    }), 'Fallback'))
      .toBe('Email is invalid Password is required');
  });

  it('distinguishes a network failure from an HTTP failure', () => {
    expect(getApiErrorMessage(axiosError(), 'Fallback')).toContain('Can’t connect to the API');
    expect(getApiErrorMessage(axiosError({ data: {} }), 'Fallback')).toBe('Fallback');
  });

  it('maps duplicate-account, missing-route, and server errors to safe messages', () => {
    expect(getApiErrorMessage(axiosError({
      status: 403,
      data: { message: 'Email này đã được sử dụng' },
    }), 'Fallback')).toContain('already uses this email or phone number');
    expect(getApiErrorMessage(axiosError({ status: 404, data: {} }), 'Fallback')).toContain('signup endpoint was not found');
    expect(getApiErrorMessage(axiosError({
      status: 500,
      data: { message: 'database password=should-not-be-shown' },
    }), 'Fallback')).toContain('Check the backend and database logs');
  });

  it('uses the fallback for non-Axios errors', () => {
    expect(getApiErrorMessage(new Error('Unexpected'), 'Fallback')).toBe('Fallback');
  });
});
