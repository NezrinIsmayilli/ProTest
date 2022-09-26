export function filterQueryResolver(filters) {
  let query = '';

  if (!filters) {
    return query;
  }

  Object.keys(filters).forEach(item => {
    const filter = filters[item];

    if (Array.isArray(filter)) {
      const arrayQuery = filter.reduce((prevValue, currentValue) => {
        prevValue +=
          prevValue === ''
            ? `${item}[]=${encodeURIComponent(currentValue)}`
            : `&${item}[]=${encodeURIComponent(currentValue)}`;
        return prevValue;
      }, '');

      if (arrayQuery) {
        if (query !== '') {
          query += `&${arrayQuery}`;
        } else {
          query += `${arrayQuery}`;
        }
      }
      return;
    }

    if ((filter || filter === 0) && query === '') {
      return (query += `${item}=${encodeURIComponent(filter)}`);
    }
    if ((filter || filter === 0) && query !== '') {
      return (query += `&${item}=${encodeURIComponent(filter)}`);
    }
  });

  return query;
}
