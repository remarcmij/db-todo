'use strict';

// eslint-disable-next-line
class Helper {
  static createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        elem.textContent = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }

  static clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  static renderButton(label, parent, clickHandler) {
    const button = Helper.createAndAppend('button', parent, {
      text: label,
      class: 'button',
    });
    if (clickHandler) {
      button.addEventListener('click', clickHandler);
    }
    return button;
  }
}
