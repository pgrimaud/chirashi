import { assert } from 'chai'
import { insertAfter } from 'chirashi'

describe('chirashi#insertAfter', () => {
  it('should be a function', () => {
    assert.isFunction(insertAfter)
  })

  it('should return element\'s insertAfter', () => {
    const maki = document.createElement('div')
    maki.id = 'insert-after-maki'
    const salmon = document.createElement('div')
    maki.appendChild(salmon)

    const cheese = document.createElement('div')

    insertAfter(salmon, cheese)

    assert.equal(cheese.previousElementSibling, salmon, 'should insert existing node')

    insertAfter(salmon, '.wasabi')

    assert.isTrue(cheese.previousElementSibling.classList.contains('wasabi'), 'should create and insert node')

    assert.isUndefined(insertAfter(window, '.null'), 'should just return if node can\'t be inserted')

    assert.equal(maki, insertAfter(maki, 149), 'should return element if trying to append something wrong')
  })
})
