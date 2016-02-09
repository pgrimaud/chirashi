import raf from 'raf'

import forEach from '../core/for-each'
import forIn from '../core/for-in'
import forElements from '../core/for-elements'
import getElements from '../core/get-elements'
import getElement from '../core/get-element'

import data from '../dom/data'
import find from '../dom/find'

import resize from '../events/resize'
import unresize from '../events/unresize'
import on from '../events/on'
import off from '../events/off'

import size from '../styles/size'
import style from '../styles/style'
import transform from '../styles/transform'

import defaultify from '../utils/defaultify'
import between from '../utils/between'

const M_PI = Math.PI,
      M_PI_2 = Math.PI / 2

const defaults = {
  accelerometer: false,
  center: {
    x: 0.5,
    y: 0.5
  },
  easing: 0.1,
  translation: {
    x: 0,
    y: 0
  },
  rotation: {
    x: 0,
    y: 0
  },
  inertia: () => {
    return {
      x: 0,
      y: 0
    }
  }
}

export class Parallax {
  constructor(options) {
    this.options = defaultify(options, defaults)

    this.frame = 0
    this.params = {
      angle: 0,
      length: 0,
      ratio: 0,
      xRatio: 0,
      yRatio: 0
    }

    this.refresh()
    this.resize()
    this.resizeCallback = resize(this.resize.bind(this))

    if (!options.paused) this.play()

    if (this.options.accelerometer && window.DeviceMotionEvent) {
        this.devicemoveCallback = this.devicemove.bind(this)
        on(window, 'devicemotion', this.devicemoveCallback)
    }
    else {
        this.mousemoveCallback = this.mousemove.bind(this)
        on(this.container, 'mousemove', this.mousemoveCallback)
    }
  }

  refresh() {
    this.container = getElement(this.options.container)

    let layerDefaults = {
      depth: this.options.depth,
      inertia: this.options.inertia,
      translation: this.options.translation,
      rotation: this.options.rotation
    }

    if (typeof layerDefaults.translation == 'number') {
      layerDefaults.translation = {
        x: layerDefaults.translation,
        y: layerDefaults.translation
      }
    }
    else {
      layerDefaults.translation = {
        x: 'x' in layerDefaults.translation ? layerDefaults.translation.x : 0,
        y: 'y' in layerDefaults.translation ? layerDefaults.translation.y : 0
      }
    }

    if (typeof layerDefaults.rotation == 'number') {
      layerDefaults.rotation = {
        x: layerDefaults.rotation,
        y: layerDefaults.rotation
      }
    }
    else {
      layerDefaults.rotation = {
        x: 'x' in layerDefaults.rotation ? layerDefaults.rotation.x : 0,
        y: 'y' in layerDefaults.rotation ? layerDefaults.rotation.y : 0
      }
    }

    this.layers = this.options.layers

    forIn(this.layers, (key, value) => {
      value = defaultify(value, layerDefaults)

      if (typeof value.translation == 'number') {
        value.translation = {
          x: value.translation,
          y: value.translation
        }
      }
      else {
        value.translation = {
          x: 'x' in value.translation ? value.translation.x : layerDefaults.translation.x,
          y: 'y' in value.translation ? value.translation.y : layerDefaults.translation.y
        }
      }

      if (typeof value.rotation == 'number') {
        value.rotation = {
          x: value.rotation,
          y: value.rotation
        }
      }
      else {
        value.rotation = {
          x: 'x' in value.rotation ? value.rotation.x : layerDefaults.rotation.x,
          y: 'y' in value.rotation ? value.rotation.y : layerDefaults.rotation.y
        }
      }

      value.currentTransformation = {
        x: 0,
        y: 0,
        rotate: {
          x: 0,
          y: 0
        }
      }

      value.elements = getElements(`[data-parallax="${key}"]`)

      this.layers[key] = value
    })
  }

  resize() {
    this.initialGravity = null
    this.containerSize = size(this.container)

    this.center = {
      x: this.containerSize.width * this.options.center.x,
      y: this.containerSize.height * this.options.center.y
    }

    this.maxLength = Math.max(this.containerSize.width, this.containerSize.height) / 2
  }

  mousemove(event) {
    if (!this.listen) return

    this.updateParams({
      x: this.center.x - event.pageX,
      y: this.center.y - event.pageY
    })
  }

  devicemove(event) {
    if (!this.listen) return

    if (!this.initialGravity) {
      this.initialGravity = {
        x: event.accelerationIncludingGravity.y,
        y: event.accelerationIncludingGravity.x
      }
    }

    this.updateParams({
      x: between((event.accelerationIncludingGravity.y - this.initialGravity.x) / 90, -1, 1) * this.center.x * this.options.accelerometer,
      y: -between((event.accelerationIncludingGravity.x - this.initialGravity.y) / 90, -1, 1) * this.center.y * this.options.accelerometer
    })
  }

  updateParams(variation) {
      this.params = {
        angle: Math.atan2(variation.y, variation.x),
        length: Math.sqrt(variation.y * variation.y + variation.x * variation.x)
      }

      this.params.ratio = this.params.length / this.maxLength
      this.params.xRatio = Math.cos(this.params.angle) * this.params.ratio
      this.params.yRatio = Math.sin(this.params.angle) * this.params.ratio
  }

  update() {
    if (!this.playing) return

    ++this.frame

    forIn(this.layers, (key, value) => {
      let inertia = value.inertia(this.frame)

      let transformation = {
        x: value.translation.x * value.depth * this.params.xRatio + inertia.x * value.depth,
        y: value.translation.y * value.depth * this.params.yRatio + inertia.y * value.depth,
        rotate: {
          x: value.rotation.x * this.params.yRatio,
          y: value.rotation.y * this.params.xRatio
        }
      }

      this.layers[key].currentTransformation = {
        x: value.currentTransformation.x + (transformation.x - value.currentTransformation.x) * this.options.easing,
        y: value.currentTransformation.y + (transformation.y - value.currentTransformation.y) * this.options.easing,
        rotate: {
          x: value.currentTransformation.rotate.x + (transformation.rotate.x - value.currentTransformation.rotate.x) * this.options.easing,
          y: value.currentTransformation.rotate.y + (transformation.rotate.y - value.currentTransformation.rotate.y) * this.options.easing
        }
      }

      transform(value.elements, this.layers[key].currentTransformation)
    })

    this.updateRequest = raf(this.update.bind(this))
  }

  pause() {
      this.listen = this.playing = false
      raf.cancel(this.updateRequest)
  }

  play() {
      if (this.playing) {
          this.listen = true
      }
      else {
          this.listen = this.playing = true
          this.updateRequest = raf(this.update.bind(this))
      }
  }

  reset() {
      this.pause()

      forIn(this.layers, (key, value) => {
        this.layers[key].currentTransformation = {
          x: 0,
          y: 0,
          rotate: {
            x: 0,
            y: 0
          }
        }

        transform(value.elements, this.layers[key].currentTransformation)
      })
  }

  kill() {
    this.playing = false
    raf.cancel(this.updateRequest)

    style(this.container, {
      perspective: ''
    })

    unresize(this.resizeCallback)
    if(this.devicemoveCallback) off(window, 'devicemotion', this.devicemoveCallback)
    if(this.mousemoveCallback) off(this.container, 'mousemove', this.mousemoveCallback)
  }
}

export default Parallax
