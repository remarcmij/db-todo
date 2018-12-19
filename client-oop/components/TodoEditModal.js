'use strict';
/* global Helper */

// eslint-disable-next-line no-unused-vars
class TodoEditModal {
  constructor(onSave) {
    this.onSave = onSave;
  }

  render(parentContainer) {
    this.overlay = Helper.createAndAppend('div', parentContainer, { class: 'modal' });
    const modalContent = Helper.createAndAppend('div', this.overlay, { class: 'modal-content' });
    this.title = Helper.createAndAppend('div', modalContent, { class: 'modal-title' });
    const body = Helper.createAndAppend('div', modalContent, { class: 'modal-body' });

    this.textInput = Helper.createAndAppend('input', body, {
      type: 'text',
      class: 'edit-text-input',
    });

    this.dateInput = Helper.createAndAppend('input', body, {
      type: 'date',
      class: 'edit-date-input',
    });

    const buttonContainer = Helper.createAndAppend('div', modalContent, {
      class: 'modal-buttons',
    });

    this.saveButton = Helper.renderButton('SAVE', buttonContainer, () => {
      const todo = Object.assign({}, this.todo, {
        description: this.textInput.value,
        due_date: this.dateInput.value,
      });
      this.onSave(todo);
      this.overlay.style.display = 'none';
    });

    this.textInput.addEventListener('input', () => this.updateSaveButtonState());

    window.onclick = event => {
      if (event.target === this.overlay) {
        this.overlay.style.display = 'none';
      }
    };
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
    this.title.innerText = todo.id ? 'Edit Todo' : 'Add Todo';
    this.textInput.value = todo.description || '';
    this.updateSaveButtonState();
    const dateString = todo.due_date ? todo.due_date.slice(0, 10) : '';
    this.dateInput.value = dateString;
    this.overlay.style.display = 'block';
    this.textInput.focus();
  }
}
