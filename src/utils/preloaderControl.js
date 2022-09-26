/**
 * Preloader control utils
 */

export function showPreloader() {
  const preloaderElement = document.querySelector('.preloader');
  preloaderElement.classList.remove('preloader--hide');
}

export function hidePreloader() {
  const preloaderElement = document.querySelector('.preloader');
  preloaderElement.classList.add('preloader--hide');
}
