'use strict';

/* global ModalDialog, Helper */

// eslint-disable-next-line no-unused-vars
class ConfirmDialog extends ModalDialog {
  renderContent(contentContainer, buttonContainer) {
    this.bodyTextContainer = Helper.createAndAppend('p', contentContainer);

    Helper.renderButton('YES', buttonContainer).addEventListener('click', () =>
      this.handleResult(true),
    );

    this.noButton = Helper.renderButton('NO', buttonContainer);
    this.noButton.addEventListener('click', () => this.handleResult(false));
  }

  handleResult(result) {
    this.hide();
    this.resolve(result);
    this.resolve = null;
  }

  confirm(bodyText) {
    return new Promise(resolve => {
      this.resolve = resolve;
      this.bodyTextContainer.textContent = bodyText;
      this.show('Please confirm');
      this.noButton.focus();
    });
  }
}
