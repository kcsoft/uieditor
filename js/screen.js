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
    widget.node.addEventListener('mousedown', this.handleMouseDownMove.bind(this), false);
    widget.node.addEventListener('setstyle', this.setWidgetStyle.bind(this), false);
    widget.node.dispatchEvent(new CustomEvent('setstyle', { detail: { left: e.offsetX, top: e.offsetY } }));

    new Resizer(widget.node);
    widget.node.querySelectorAll('.resizer').forEach(node => {
      node.addEventListener('mousedown', this.handleMouseDownResize.bind(this), false);
    });
    return true;
  }

  /* widget move */
  handleMouseDownOld_____________(e) {
    this.mouseIsDown = true;
    this.movingWidget = e.currentTarget;
    this.movingWidgetOffset = {
      left: this.movingWidget.offsetLeft - e.clientX,
      top: this.movingWidget.offsetTop - e.clientY,
    }
    this.selectWidget(this.movingWidget);
  }
  handleMouseDownMove(e) {
    e.stopPropagation();
    this.mouseIsDownMoving = true;
    this.movingWidget = e.currentTarget;
    this.movingInitial = {
      x: this.movingWidget.offsetLeft,
      y: this.movingWidget.offsetTop,
    };
    this.movingWidgetOffset = {
      left: this.movingWidget.offsetLeft - e.clientX,
      top: this.movingWidget.offsetTop - e.clientY,
    };
    this.selectWidget(this.movingWidget);
  }
  handleMouseDownResize(e) {
    e.stopPropagation();
    this.mouseIsDownResizing = true;
    this.movingWidget = e.currentTarget.parentNode;
    this.movingInitial = {
      x: this.movingWidget.offsetLeft,
      y: this.movingWidget.offsetTop,
      height: this.movingWidget.offsetHeight, 
      width: this.movingWidget.offsetWidth
    };
    this.movingWidgetOffset = {
      left: e.pageX,
      top: e.pageY,
      dx: parseInt(e.currentTarget.dataset.w, 10),
      dy: parseInt(e.currentTarget.dataset.h, 10),
    };
    this.selectWidget(this.movingWidget);
  }
  handleMouseUp(e) {
    this.mouseIsDownMoving = false;
    this.mouseIsDownResizing = false;
  }
  handleMouseMove_____________________________(e) {
    if (this.mouseIsDown) {
      e.preventDefault();
      this.movingWidget.dispatchEvent(new CustomEvent('setstyle', { detail: {
        left: e.clientX + this.movingWidgetOffset.left,
        top:  e.clientY + this.movingWidgetOffset.top,
      }}));
    }
  }
  handleMouseMove(e) {
    if (this.mouseIsDownMoving) {
      e.preventDefault();
      const target = {
        x: Math.min(
          this.node.offsetWidth  - this.movingWidget.offsetWidth,
          Math.max(0, Math.trunc((e.clientX + this.movingWidgetOffset.left) / 2) * 2)
        ),
        y: Math.min(
          this.node.offsetHeight - this.movingWidget.offsetHeight,
          Math.max(0, Math.trunc((e.clientY + this.movingWidgetOffset.top) / 2) * 2)
        )
      };
      const step = {
        x: Math.sign(target.x - this.movingInitial.x) * 2,
        y: Math.sign(target.y - this.movingInitial.y) * 2,
      }
      const state = this.transformWidget(null, this.movingInitial, step, target);
      this.setWidgetStyles(this.movingWidget, state);
    }

    if (this.mouseIsDownResizing) {
      e.preventDefault();
      let moveX = e.pageX - this.movingWidgetOffset.left;
      let moveY = e.pageY - this.movingWidgetOffset.top;
      let maxMove = Math.max(Math.abs(moveX), Math.abs(moveY));
      const sign = Math.abs(moveX) > Math.abs(moveY) ? Math.sign(moveX) : Math.sign(moveY);
      moveX = Math.sign(moveX) * sign * maxMove;
      moveY = Math.sign(moveY) * sign * maxMove;
      // moveX trunc 2
      const target = {
        height: this.movingInitial.height + moveY * this.movingWidgetOffset.dy,
        width: this.movingInitial.width + moveX * this.movingWidgetOffset.dx
      };
      const step = {
        width: Math.sign(moveX * this.movingWidgetOffset.dx) * 2,
        height: Math.sign(moveY * this.movingWidgetOffset.dy) * 2,
      };
      if (this.movingWidgetOffset.dx < 0) {
        target.x = this.movingInitial.x + moveX;
        step.x = Math.sign(target.x - this.movingInitial.x) * 2;
      }
      if (this.movingWidgetOffset.dy < 0) {
        target.y = this.movingInitial.y + moveY;
        step.y = Math.sign(target.y - this.movingInitial.y) * 2;
      }
      const state = this.transformWidget(null, this.movingInitial, step, target);
      this.setWidgetStyles(this.movingWidget, state);
      console.log('resize', moveX, moveY, moveX * this.movingWidgetOffset.dx, moveY * this.movingWidgetOffset.dy, state);
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

  transformWidget(id, initial, step, target) {
    console.log(initial, step, target);
    let state = Object.assign({}, initial);
    let counter = 0;
    let result = null;
    while (!result) {
      const nextState = Object.assign({}, state);
      Object.keys(step).forEach(prop => nextState[prop] += step[prop]);
      // if valid continue else return state
      Object.keys(target).forEach(prop => {
        if (nextState[prop] == target[prop]) {
          delete step[prop];
          if (Object.keys(step).length === 0) {
            result = Object.assign({}, nextState);
          }
        }
      });
      state = nextState;
      if (++counter > 2000) return {};
    }
    return result;
  }
  setWidgetStyles(widget, state) {
    const props = { x: 'left', y: 'top', width: 'width', height: 'height' };
    const style = {};
    Object.keys(props).forEach(prop => {
      if (state.hasOwnProperty(prop)) {
        style[props[prop]] = state[prop] + 'px';
      }
    });
    Object.assign(widget.style, style);
  }

}

export default Screen;
