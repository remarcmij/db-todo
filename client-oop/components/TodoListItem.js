'use strict';

/* global View */

// eslint-disable-next-line no-unused-vars
class TodoListItem {
  constructor(todo, model, onEdit) {
    this.todo = todo;
    this.model = model;
    this.onEdit = onEdit;
  }

  renderCheckbox(parent) {
    const checkboxId = `todo-${this.todo.id}`;
    View.createAndAppend('label', parent, {
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
    const checkBox = View.createAndAppend('input', parent, checkboxOptions);
    checkBox.addEventListener('change', async () => {
      this.todo.done = this.todo.done === 'n' ? 'y' : 'n';
      this.model.persistTodo(this.todo);
    });
  }

  renderTodoDeleteButton(parent) {
    View.renderButton('DELETE', parent, async () => {
      if (confirm('Deleting todo: please confirm')) {
        this.model.deleteTodo(this.todo);
      }
    });
  }

  render(listContainer) {
    const li = View.createAndAppend('li', listContainer, { class: 'todo-list-item' });
    const containerDiv = View.createAndAppend('div', li, {
      class: 'todo-list-item-container',
    });

    View.createAndAppend('div', containerDiv, {
      text: this.todo.description,
      class: this.todo.done === 'y' ? 'todo-list-item-done' : '',
    });

    const rightPart = View.createAndAppend('div', containerDiv, {
      class: 'todo-list-item-right',
    });
    const dateString = this.todo.due_date ? new Date(this.todo.due_date).toLocaleDateString() : '';
    View.createAndAppend('div', rightPart, { text: dateString, class: 'todo-list-due-date' });

    this.renderTodoDeleteButton(rightPart, this.todo);
    View.renderButton('EDIT', rightPart, this.onEdit);
    this.renderCheckbox(rightPart);
  }
}
