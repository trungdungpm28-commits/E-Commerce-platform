import { describe, expect, it } from 'vitest';
import { isValidFullName } from './validation';

describe('isValidFullName', () => {
  it('accepts Vietnamese names and Unicode combining marks', () => {
    expect(isValidFullName('Dũng Matrix')).toBe(true);
    expect(isValidFullName('Du\u0303ng Matrix')).toBe(true);
  });

  it('accepts single names and surrounding whitespace', () => {
    expect(isValidFullName('  An  ')).toBe(true);
  });

  it('rejects empty values and punctuation or digits', () => {
    expect(isValidFullName('  ')).toBe(false);
    expect(isValidFullName('Dũng 2')).toBe(false);
    expect(isValidFullName('Dũng-Matrix')).toBe(false);
  });
});
