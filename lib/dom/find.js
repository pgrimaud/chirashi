import _chirasizeArray from '../_internals/_chirasizeArray'
import forElements from '../core/forElements'

/**
 * Iterates over each element of elements and returns an array containing all elements' children matching a selector.
 * @param {(string|Array|NodeList|HTMLCollection|document|HTMLElement|SVGElement)} elements - The iterable, selector or elements.
 * @param {string} selector - The selector.
 * @return {Array} found - The elements' children matching the selector.
 * @return {function} found.chrshPush - Methods to push dom elements into the array. Accepts same input as getElements.
 * @example //esnext
 * import { createElement, append, find } from 'chirashi'
 * const maki = createElement('.maki')
 * append(maki, ['.salmon[data-fish][data-inside]', '.avocado[data-inside]'])
 * const roll = createElement('.roll')
 * append(roll, '.tuna[data-fish][data-inside]')
 * append(document.body, [maki, roll])
 * find('div', '[data-fish]') //returns: [<div class="salmon" data-fish data-inside></div>, <div class="tuna" data-fish data-inside></div>]
 * find(maki, '[data-inside]') //returns: [<div class="salmon" data-fish data-inside></div>, <div class="avocado" data-inside></div>]
 * @example //es5
 * var maki = Chirashi.createElement('.maki')
 * Chirashi.append(maki, ['.salmon[data-fish][data-inside]', '.avocado[data-inside]'])
 * var roll = Chirashi.createElement('.roll')
 * Chirashi.append(roll, '.tuna[data-fish][data-inside]')
 * Chirashi.append(document.body, [maki, roll])
 * Chirashi.find('div', '[data-fish]') //returns: [<div class="salmon" data-fish data-inside></div>, <div class="tuna" data-fish data-inside></div>]
 * Chirashi.find(maki, '[data-inside]') //returns: [<div class="salmon" data-fish data-inside></div>, <div class="avocado" data-inside></div>]
 */
export default function find (elements, selector) {
  let found = []

  forElements(elements, element => {
    if (!('querySelectorAll' in element)) return

    found.push(...element.querySelectorAll(selector))
  })

  return _chirasizeArray(found)
}