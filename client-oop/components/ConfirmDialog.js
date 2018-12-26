'use strict';
'use strict';
/* global ModalDialog, Helper */

// eslint-disable-next-line no-unused-vars
class ConfirmDialog extends ModalDialog {
  constructor(parent) {
    super(parent);
    this.handleYes = this.handleYes.bind(this);
    this.handleNo = this.handleNo.bind(this);
  }

  renderContent(contentContainer, buttonContainer) {
    this.bodyTextContainer = Helper.createAndAppend('p', contentContainer);
    this.yesButton = Helper.renderButton('YES', buttonContainer);
    this.noButton = Helper.renderButton('NO', buttonContainer);
  }

  handleYes() {
    this.handleResult(true);
  }

  handleNo() {
    this.handleResult(false);
  }

  cancel() {
    if (this.resolve) {
      this.handleNo();
    }
  }

  handleResult(result) {
    this.hide();
    this.resolve(result);
    this.resolve = null;
    this.yesButton.removeEventListener('click', this.handleYes);
    this.noButton.removeEventListener('click', this.handleNo);
  }

  confirm(bodyText) {
    return new Promise(resolve => {
      this.resolve = resolve;
      this.bodyTextContainer.textContent = bodyText;
      this.show('Please confirm');
      this.noButton.focus();
      this.yesButton.addEventListener('click', this.handleYes);
      this.noButton.addEventListener('click', this.handleNo);
    });
  }
}
