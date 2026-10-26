const fullNamePattern = /^(?:\p{L}\p{M}*)+(?:\s+(?:\p{L}\p{M}*)+)*$/u;

export function isValidFullName(value: string): boolean {
  return fullNamePattern.test(value.trim());
}
