export function groupBy<T>(
  arr: T[],
  getKey: (item: T) => string
): { [key: string]: T[] } {
  return arr.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as { [key: string]: T[] });
}
