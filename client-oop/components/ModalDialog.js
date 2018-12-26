'use strict';
/* global Helper */

// eslint-disable-next-line no-unused-vars
class ModalDialog {
  constructor(parent) {
    this.parent = parent;
  }

  render() {
    this.overlay = Helper.createAndAppend('div', this.parent, { class: 'modal' });
    const modalContainer = Helper.createAndAppend('div', this.overlay, { class: 'modal-content' });
    this.title = Helper.createAndAppend('div', modalContainer, { class: 'modal-title' });
    const contentContainer = Helper.createAndAppend('div', modalContainer, { class: 'modal-body' });
    const buttonContainer = Helper.createAndAppend('div', modalContainer, {
      class: 'modal-buttons',
    });

    this.hide();

    window.onclick = event => {
      if (event.target === this.overlay) {
        if (typeof this.cancel === 'function') {
          this.cancel();
        }
        this.hide();
      }
    };

    this.renderContent(contentContainer, buttonContainer);
  }

  show(title) {
    this.title.textContent = title;
    this.overlay.style.display = 'block';
  }

  hide() {
    this.overlay.style.display = 'none';
  }

  renderContent() {
    throw new Error('subclass must implement ');
  }
}
