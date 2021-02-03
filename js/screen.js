import allWidgets from './widgets.js';
import Resizer from './resizer.js';

class Screen {
  constructor(node) {
    this.node = node;

    node.addEventListener('dragover', this.handleDragOver, false);
    node.addEventListener('dragenter', this.handleDragEnter, false);
    node.addEventListener('dragleave', this.handleDragLeave, false)
    node.addEventListener('drop', this.handleDrop.bind(this), true);

    /* screen widget move events */
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
  }

  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    return true;
  }

  handleDragEnter(e) {
    this.classList.add('over');
  }

  handleDragLeave(e) {
    this.classList.remove('over');
  }

  handleDrop(e) {
    if (e.target !== this.node) return;
    e.stopPropagation();
    e.currentTarget.classList.remove('over');
    const elementClass = e.dataTransfer.getData('text/plain');

    const widget = new allWidgets[elementClass].widgetClass();
    e.currentTarget.appendChild(widget.node);
    widget.node.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
    widget.node.addEventListener('setstyle', this.setWidgetStyle.bind(this), false);
    widget.node.dispatchEvent(new CustomEvent('setstyle', { detail: { left: e.offsetX, top: e.offsetY } }));

    new Resizer(widget.node);
    return true;
  }

  /* widget move */
  handleMouseDown(e) {
    this.mouseIsDown = true;
    this.movingWidget = e.currentTarget;
    this.movingWidgetOffset = {
      left: this.movingWidget.offsetLeft - e.clientX,
      top: this.movingWidget.offsetTop - e.clientY,
    }
    this.selectWidget(this.movingWidget);
  }
  handleMouseUp(e) {
    this.mouseIsDown = false;
  }
  handleMouseMove(e) {
    if (this.mouseIsDown) {
      e.preventDefault();
      this.movingWidget.dispatchEvent(new CustomEvent('setstyle', { detail: {
        left: e.clientX + this.movingWidgetOffset.left,
        top:  e.clientY + this.movingWidgetOffset.top,
      }}));
    }
  }

  selectWidget(node) {
    this.node.querySelectorAll('.active').forEach(node => {
      node.classList.remove('active');
    });
    node.classList.add('active');
  }

  parseStyleIntValue(value) {
    return parseInt((value + '').replace('px', ''), 10);
  }
  setWidgetStyle(e) {
    if (!e.detail) {
      return;
    }

    if (typeof e.detail.width !== 'undefined' || typeof e.detail.height !== 'undefined') {
      ['left', 'top'].forEach(prop => {
        if (typeof e.detail[prop] !== 'undefined') {
          e.detail[prop] =  Math.trunc((this.parseStyleIntValue(e.detail[prop]) + 1) / 2) * 2 + 'px';
        }
      });
      const width = typeof e.detail.width !== 'undefined' ? this.parseStyleIntValue(e.detail.width) : e.target.offsetWidth;
      const height = typeof e.detail.height !== 'undefined' ? this.parseStyleIntValue(e.detail.height) : e.target.offsetHeight;
      const left = typeof e.detail.left !== 'undefined' ? this.parseStyleIntValue(e.detail.left) : e.target.offsetLeft;
      const top = typeof e.detail.top !== 'undefined' ? this.parseStyleIntValue(e.detail.top) : e.target.offsetTop;

      if (left < 0 || top < 0
        || width < 20 || height < 20
        || left + width >= this.node.offsetWidth || top + height >= this.node.offsetHeight) {
        return;
      }
    } else {
      if (typeof e.detail.left !== 'undefined') {
        e.detail.left = Math.min((this.node.offsetWidth - e.target.offsetWidth - 1), Math.max(0, this.parseStyleIntValue(e.detail.left)));
      }
      if (typeof e.detail.top !== 'undefined') {
        e.detail.top = Math.min((this.node.offsetHeight - e.target.offsetHeight - 1), Math.max(0, this.parseStyleIntValue(e.detail.top)));
      }
    }
    ['left', 'top', 'width', 'height'].forEach(prop => {
      if (typeof e.detail[prop] !== 'undefined') {
        e.detail[prop] =  Math.trunc(this.parseStyleIntValue(e.detail[prop]) / 2) * 2 + 'px';
      }
    });
    // console.log(e.target, e.detail);
    Object.assign(e.target.style, e.detail);
  }
}

export default Screen;
