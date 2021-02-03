class WidgetBase {
  constructor(props) {
    const _props = Object.assign({
      width: 0, height: 0, x: 0, y: 0,
    }, props);
    for (const [key, value] of Object.entries(_props)) {
      this[key] = value;
    }
    this.node = document.createElement('div');
    this.node.classList.add('widget');
    this.node.dataset.id = '1';
  }
}

export default WidgetBase;
