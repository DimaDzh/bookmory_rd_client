export const interpolate = (
  template: string,
  values: Record<string, string | number>
) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
};
