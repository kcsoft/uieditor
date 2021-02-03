import Widget from './widgetBase.js'

class Rectangle extends Widget {
  constructor(props) {
    super(props);
    this.node.style.height = '60px';
    this.node.style.width = '110px';
    this.node.innerHTML = '<div>Rectangle</div>';
  }
}

class Circle extends Widget {
  constructor(props) {
    super(props);
    this.node.style.height = '100px';
    this.node.style.width = '100px';
    this.node.innerHTML = '<div style="background-color: #ccc; border-radius: 50%;">Circle</div>';
  }
}

export default {
  Rectangle: { icon: '<span>&plusb;</span>', widgetClass: Rectangle },
  Circle: { icon: '<span>&oplus;</span>', widgetClass: Circle },
};
