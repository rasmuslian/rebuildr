export function idFromObject(object: { id: string } | string) {
  return typeof object === 'string' ? object : object.id;
}
