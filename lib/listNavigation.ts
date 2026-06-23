export function listPathWithQuery(
  listPath: string,
  queryString: string
): string {
  return queryString ? `${listPath}?${queryString}` : listPath;
}
