'use strict';
/* global ModalDialog, Store, Helper */

// eslint-disable-next-line no-unused-vars
class TodoEditModal extends ModalDialog {
  constructor(store, parent) {
    super(parent);
    this.store = store;
    this.store.subscribe(this);
  }

  update(action) {
    switch (action.type) {
      case Store.OPEN_EDIT_DIALOG:
        this.edit(action.payload);
        break;
    }
  }

  renderContent(contentContainer, buttonContainer) {
    this.textInput = Helper.createAndAppend('input', contentContainer, {
      type: 'text',
      class: 'edit-text-input',
    });

    this.dateInput = Helper.createAndAppend('input', contentContainer, {
      type: 'date',
      class: 'edit-date-input',
    });

    this.saveButton = Helper.renderButton('SAVE', buttonContainer, () => {
      const todo = Object.assign({}, this.todo, {
        description: this.textInput.value,
        due_date: this.dateInput.value,
      });
      this.store.saveTodo(todo);
      this.hide();
    });

    Helper.renderButton('CANCEL', buttonContainer, () => this.hide());

    this.textInput.addEventListener('input', () => this.updateSaveButtonState());
  }

  updateSaveButtonState() {
    const text = this.textInput.value;
    if (text.trim() === '') {
      this.saveButton.setAttribute('disabled', '');
    } else {
      this.saveButton.removeAttribute('disabled');
    }
  }

  edit(todo = {}) {
    this.todo = todo;
    this.textInput.value = todo.description || '';
    this.updateSaveButtonState();
    const dateString = todo.due_date ? todo.due_date.slice(0, 10) : '';
    this.dateInput.value = dateString;
    this.show(todo.id ? 'Edit Task' : 'Add Task');
    this.textInput.focus();
  }
}
