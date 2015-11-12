import { forEach, forElements, getElements } from '../core';
import { parent } from '../dom';
import { resize, unresize, load, watchProp, unwatchProp } from '../events';
import { style, size } from '../styles';
import { defaultify } from '../utils/defaultify';

export class Cover {
  constructor(options = {}) {
    this.options = options;

    this.items = [];

    if (this.options.items)
        forEach(this.options.items, (item) => {
          this.addElements(item);
        });

    this.resizeCallback = resize(this.resizeAll.bind(this));
  }

  addElements(item) {
    forElements(item.elements, (element) => {
      let index = this.items.push({
        element: element,
        mode: item.mode,
        size: item.size
      });

      style(parent(element), {
        position: 'relative',
        overflow: 'hidden'
      });

      style(element, {
        position: 'absolute',
        top: '50%',
        left: '50%'
      });

      let newItem = this.items[index-1];

      if(!newItem.size) {
          newItem.watcher = watchProp(element, 'src', (value) => {
            this.loadAndResize(newItem);
          });
      }

      if (newItem.forceResize) {
          this.loadAndResize(newItem);
      }
    });
  }

  removeElements(elements) {
    forElements(elements, (element) => {
      size(element, {width:'', height: ''});

      style(parent(element), {
        position: '',
        overflow: ''
      });

      style(element, {
        position: '',
        top: '',
        left: ''
      });

      let i = this.items.length, found = false;
      while(!found && i--) {
          if (found = element == this.items[i].elements) {
              this.items.slice(i, 1);
          }
      }
    });
  }

  resizeAll() {
    forEach(this.items, this.resize.bind(this));
  }

  loadAndResize(item) {
      if (!item.size) {
          load(item.element, () => {
              console.log('load', item.element);
            this.resize(item);
          });
      }
      else this.resize(item);
  }

  resize(item) {
      let ratio,
          imgWidth = (item.size && item.size.width) || item.element.naturalWidth || item.element.videoWidth,
          imgHeight = (item.size && item.size.height) || item.element.naturalHeight || item.element.videoHeight,
          parentSize = size(parent(item.element)),
          widthRatio = parentSize.width / imgWidth,
          heightRatio = parentSize.height / imgHeight;

      switch (item.mode) {
        case 'fill':
          ratio = Math.max(widthRatio, heightRatio);

          break;
        case 'fit':
          ratio = Math.min(widthRatio, heightRatio);

          break;

        default:
          ratio = 1;
      }

      let width = ratio * imgWidth,
          height = ratio * imgHeight;

      size(item.element, {
        width: width,
        height: height
      });

      style(item.element, {
        marginTop: -height / 2,
        marginLeft: -width / 2
      });
  }

  kill() {
    unresize(this.resizeCallback);

    forEach(this.items, (item) => {
        size(item.element, {width: '', height: ''});

        if (item.watcher) unwatch(item.watcher);

        style(parent(item.element), {
          position: '',
          overflow: ''
        });

        style(item.element, {
          position: '',
          top: '',
          right: '',
          bottom: '',
          left: '',
          margin: ''
        });
    });
  }
};
