'use strict';

/* global Helper */

// eslint-disable-next-line no-unused-vars
class TodoListItem {
  constructor(props) {
    this.props = props;
  }

  renderCheckbox(parent) {
    const { todo, onSave } = this.props;
    const checkboxId = `todo-${todo.id}`;
    Helper.createAndAppend('label', parent, {
      text: 'Done',
      for: checkboxId,
      class: 'checkbox-label',
    });
    const checkboxOptions = {
      type: 'checkbox',
      id: checkboxId,
      'data-todo-id': todo.id,
    };
    if (todo.done === 'y') {
      checkboxOptions.checked = '';
    }
    Helper.createAndAppend('input', parent, checkboxOptions).addEventListener('change', () => {
      todo.done = todo.done === 'n' ? 'y' : 'n';
      onSave();
    });
  }

  renderTodoDeleteButton(parent) {
    Helper.renderButton('DELETE', parent, this.props.onDelete);
  }

  render(listContainer) {
    const li = Helper.createAndAppend('li', listContainer, { class: 'todo-list-item' });
    const containerDiv = Helper.createAndAppend('div', li, {
      class: 'todo-list-item-container',
    });

    const { todo, onEdit } = this.props;

    Helper.createAndAppend('div', containerDiv, {
      text: todo.description,
      class: todo.done === 'y' ? 'todo-list-item-done' : '',
    });

    const rightPart = Helper.createAndAppend('div', containerDiv, {
      class: 'todo-list-item-right',
    });
    const dateString = todo.due_date ? new Date(todo.due_date).toLocaleDateString() : '';
    Helper.createAndAppend('div', rightPart, { text: dateString, class: 'todo-list-due-date' });

    this.renderTodoDeleteButton(rightPart);
    Helper.renderButton('EDIT', rightPart, onEdit);
    this.renderCheckbox(rightPart);
  }
}
