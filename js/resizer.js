const resizerStatic = { // safari doesn't support static class
  isInitialized: false,

  init() {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
  },

  handleMouseUp(e) {
    this.mouseIsDown = false;
  },

  handleMouseMove(e) {
    if (this.mouseIsDown) {
      e.preventDefault();
      let dx = parseInt(this.node.dataset.w, 10);
      let dy = parseInt(this.node.dataset.h, 10);
      let offsetX = (e.pageX - this.initial.x) * dx, offsetY = (e.pageY - this.initial.y) * dy;
      const style = {};
      if (dx && dy) { // keep aspect ratio
        offsetX = Math.max(offsetX, offsetY);
        offsetY = offsetX;
      }
      style.width = this.initial.width + offsetX + 'px';
      style.height = this.initial.height + offsetY + 'px';
      if (dx < 0) {
        style.left = this.initial.left + dx * offsetX + 'px';
      }
      if (dy < 0) {
        style.top = this.initial.top + dy * offsetY + 'px';
      }
      this.node.parentNode.dispatchEvent(new CustomEvent('setstyle', { detail: style }));
    }
  },
};

class Resizer {
  constructor(element, options = {}) {
    this.element = element;
    this.size = options.size || 10;
    const nodes = [
      this.appendResizerE({}),
      this.appendResizerW({}),
      this.appendResizerN({}),
      this.appendResizerS({}),
      this.appendResizerNE({}),
      this.appendResizerNW({}),
      this.appendResizerSE({}),
      this.appendResizerSW({}),
    ];
    nodes.forEach(node => {
      node.addEventListener('mousedown', this.handleMouseDown.bind(this), false); 
    });
    resizerStatic.init();
  }

  handleMouseDown(e) {
    resizerStatic.mouseIsDown = true;
    resizerStatic.node = e.currentTarget;
    resizerStatic.resizer = this;
    resizerStatic.initial = {
      x: e.pageX,
      y: e.pageY,
      left: resizerStatic.node.parentNode.offsetLeft,
      top: resizerStatic.node.parentNode.offsetTop,
      width: resizerStatic.node.parentNode.offsetWidth,
      height: resizerStatic.node.parentNode.offsetHeight,
    };
    e.stopPropagation();
  }

  appendResizerNE(styles) {
    const node = document.createElement('div');
    Object.assign(node.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      height: this.size + 'px', 
      width: this.size + 'px',
      cursor: 'nw-resize',
    }, styles);
    this.element.appendChild(node);
    node.dataset.w = '-1';
    node.dataset.h = '-1';
    return node;
  }
  appendResizerNW() {
    const node = this.appendResizerNE({
      left: '',
      right: 0,
      cursor: 'ne-resize',
    });
    node.dataset.w = '1';
    return node;
  }
  appendResizerSE(styles) {
    const node = this.appendResizerNE({
      top: '',
      bottom: 0,
      cursor: 'ne-resize',
    });
    node.dataset.h = '1';
    return node;
  }
  appendResizerSW(styles) {
    const node = this.appendResizerNE({
      top: '',
      bottom: 0,
      left: '',
      right: 0,
      cursor: 'nw-resize',
    });
    node.dataset.w = '1';
    node.dataset.h = '1';
    return node;
  }

  appendResizerE(styles) {
    const node = document.createElement('div');
    Object.assign(node.style, {
      position: 'absolute',
      padding: this.size + 'px 0',
      top: 0,
      left: 0,
      height: '100%',
      width: this.size + 'px',
      cursor: 'w-resize',
    }, styles);
    this.element.appendChild(node);
    node.dataset.w = '-1';
    node.dataset.h = '0';
    return node;
  }
  appendResizerW() {
    const node = this.appendResizerE({
      left: '',
      right: 0,
    });
    node.dataset.w = '1';
    return node;
  }
  appendResizerN(styles) {
    const node = this.appendResizerE(Object.assign({
      padding: '0 ' + this.size + 'px',
      height: this.size + 'px',
      width: '100%',
      cursor: 's-resize',
    }, styles));
    node.dataset.w = '0';
    node.dataset.h = '-1';
    return node;
  }
  appendResizerS() {
    const node = this.appendResizerN({
      top: '',
      bottom: 0,
    });
    node.dataset.h = '1';
    return node;
  }
}

export default Resizer;