import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

export function getQueryStringFromUrl(string, defaultValue, list) {
  const query = new URLSearchParams(window.location.search);
  const queryString = query.get(string);
  return list.includes(+queryString) ? queryString : defaultValue;
}

export const addQueryStringToURL = (query, value) => {
  const queryString = new URLSearchParams(window.location.search);
  if (queryString.has(query)) {
    window.history.pushState(
      null,
      null,
      updateQueryStringParameter(window.location.href, query, value)
    );
  } else {
    queryString.append(query, value);
    window.history.pushState(
      null,
      null,
      window.location.href.concat(`?${queryString.toString()}`)
    );
  }
};

export function updateQueryStringParameter(uri, key, value) {
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, `$1${key}=${value}$2`);
  }

  return `${uri + separator + key}=${value}`;
}
