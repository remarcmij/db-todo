'use strict';

/* global Helper */

// eslint-disable-next-line no-unused-vars
class TodoListItem {
  constructor(todo, model, onEdit) {
    this.todo = todo;
    this.model = model;
    this.onEdit = onEdit;
  }

  renderCheckbox(parent) {
    const checkboxId = `todo-${this.todo.id}`;
    Helper.createAndAppend('label', parent, {
      text: 'Done',
      for: checkboxId,
      class: 'checkbox-label',
    });
    const checkboxOptions = {
      type: 'checkbox',
      id: checkboxId,
      'data-todo-id': this.todo.id,
    };
    if (this.todo.done === 'y') {
      checkboxOptions.checked = '';
    }
    const checkBox = Helper.createAndAppend('input', parent, checkboxOptions);
    checkBox.addEventListener('change', async () => {
      this.todo.done = this.todo.done === 'n' ? 'y' : 'n';
      this.model.saveTodo(this.todo);
    });
  }

  renderTodoDeleteButton(parent) {
    Helper.renderButton('DELETE', parent, async () => {
      if (confirm('Deleting todo: please confirm')) {
        this.model.deleteTodo(this.todo);
      }
    });
  }

  render(listContainer) {
    const li = Helper.createAndAppend('li', listContainer, { class: 'todo-list-item' });
    const containerDiv = Helper.createAndAppend('div', li, {
      class: 'todo-list-item-container',
    });

    Helper.createAndAppend('div', containerDiv, {
      text: this.todo.description,
      class: this.todo.done === 'y' ? 'todo-list-item-done' : '',
    });

    const rightPart = Helper.createAndAppend('div', containerDiv, {
      class: 'todo-list-item-right',
    });
    const dateString = this.todo.due_date ? new Date(this.todo.due_date).toLocaleDateString() : '';
    Helper.createAndAppend('div', rightPart, { text: dateString, class: 'todo-list-due-date' });

    this.renderTodoDeleteButton(rightPart, this.todo);
    Helper.renderButton('EDIT', rightPart, this.onEdit);
    this.renderCheckbox(rightPart);
  }
}
