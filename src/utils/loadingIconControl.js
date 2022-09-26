/**
 * Loading icon control utils
 */

export function showLoader() {
  const loadingElement = document.querySelector('#loading');
  loadingElement.style.display = 'block';
}

export function hideLoader() {
  const loadingElement = document.querySelector('#loading');
  loadingElement.style.display = 'none';
}
