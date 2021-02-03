import allWidgets from './widgets.js';

class Palette {
  constructor(node) {
    this.node = node;
    for (const [key, widget] of Object.entries(allWidgets)) {
      const icon = document.createElement('div');
      icon.setAttribute('draggable', true);
      icon.setAttribute('title', key);
      icon.innerHTML = widget.icon;
      icon.addEventListener('dragstart', this.handleDragStart, false);
      icon.addEventListener('dragend', this.handleDragEnd, false);
      node.appendChild(icon);
    }
  }

  /* palette iccn event handlers */
  handleDragStart(e) {
    e.dataTransfer.setData('text/plain', this.getAttribute('title'));
    this.style.opacity = '0.4';
  }

  handleDragEnd(e) {
    this.style.opacity = '1';
  }
}

export default Palette;
