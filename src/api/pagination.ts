// Fetch every page before calculating whole-register summaries.
export async function allPages<T>(request: (page: number) => Promise<{ rows: T[]; totalPages: number }>): Promise<T[]> {
  const first = await request(1);
  const rows = [...first.rows];
  for (let page = 2; page <= first.totalPages; page++) rows.push(...(await request(page)).rows);
  return rows;
}
