import { assert } from 'chai'
import { on } from 'chirashi'

describe('chirashi#on', () => {
  it('should be a function', () => {
    assert.isFunction(on)
  })

  it('should bind event on elements', done => {
    let maki = document.createElement('div')
    maki.classList.add('on', 'maki')

    let maki2 = document.createElement('div')
    maki2.classList.add('on', 'maki2')

    const calls = {
      value: 0
    }

    const callback = event => {
      console.log('clicked callback')
      assert.equal(event.target, maki, 'should bind event')

      if (++calls.value === 2) {
        setTimeout(() => {
          maki.removeEventListener('click', callback)

          done()
        }, 200)
      }
    }

    const off = on([maki, maki2], {
      'click': callback
    })

    off(maki2, 'click')

    maki2.dispatchEvent(new window.CustomEvent('click', {
      bubbles: true,
      cancelable: true
    }))

    maki.dispatchEvent(new window.CustomEvent('click', {
      bubbles: true,
      cancelable: true
    }))

    off()

    const off2 = on([maki, maki2], {
      'click': {
        handler: callback,
        capture: false
      }
    })

    off2(maki2, 'click')

    maki2.dispatchEvent(new window.CustomEvent('click', {
      bubbles: true,
      cancelable: true
    }))

    maki.dispatchEvent(new window.CustomEvent('click', {
      bubbles: true,
      cancelable: true
    }))

    off2()
  })
})
