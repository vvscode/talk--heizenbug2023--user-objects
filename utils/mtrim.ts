export function mtrim(str: string): string {
  return (Array.isArray(str) ? str.toString() : str)
    .trim()
    .split('\n')
    .map((el) => el.trim())
    .join('\n');
}
