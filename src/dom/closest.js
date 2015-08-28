import { getElement } from '../core';

export function closest (element, selector) {
  element = getElement(element);

  return (!(element instanceof HTMLElement)
    ? null
    : (element.matches(selector)
      ? element
      : closest(element.parentNode, selector)));
}
