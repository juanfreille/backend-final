export function generateNewId(items) {
  return (
    items.reduce((maxId, item) => (item.id > maxId ? item.id : maxId), 0) + 1
  );
}
