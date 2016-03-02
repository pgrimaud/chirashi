import getElement from '../core/get-element'

export function getStyle (element, property) {
  element = getElement(element)
  if (!element) return

  let ret = getComputedStyle(element)[property]

  return (ret.indexOf('px') == -1) ? ret : parseInt(ret, 10)
}

export default getStyle