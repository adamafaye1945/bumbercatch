// Turns a partial object into a parameterized "col1 = $1, col2 = $2" SQL
// fragment, so every service's update function can share one implementation
// instead of hand-writing a SET clause per resource.
export function buildUpdateSet(
  fields: Record<string, unknown>,
  startIndex = 1
): { setClause: string; values: unknown[] } {
  const keys = Object.keys(fields).filter((key) => fields[key] !== undefined);
  const setClause = keys.map((key, i) => `${key} = $${i + startIndex}`).join(", ");
  const values = keys.map((key) => fields[key]);
  return { setClause, values };
}
