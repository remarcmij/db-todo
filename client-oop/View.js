'use strict';
/* global Model, TodoListItem, TodoEditModal */

// eslint-disable-next-line no-unused-vars
class View {
  static createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        elem.innerText = value;
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

  static renderError(error, container) {
    View.clearContainer(container);
    View.createAndAppend('div', container, {
      text: error.message,
      class: 'alert alert-error',
    });
  }

  static renderButton(label, parent, clickHandler) {
    const button = View.createAndAppend('button', parent, {
      text: label,
      class: 'button',
    });
    button.addEventListener('click', clickHandler);
    return button;
  }

  constructor(model) {
    this.model = model;
    this.model.subscribe(this);
  }

  async initialize() {
    try {
      const root = document.getElementById('root');
      const header = View.createAndAppend('header', root, { class: 'header' });
      this.renderHeader(header);
      this.mainContainer = View.createAndAppend('div', root, { class: 'todos-container' });

      this.todoEditModal = new TodoEditModal(this.model);
      this.todoEditModal.render(this.mainContainer);

      this.todoListContainer = View.createAndAppend('ul', this.mainContainer);

      await this.model.loadTodoLists();
      if (this.model.todoLists.length !== 0) {
        await this.model.loadTodoItems(this.model.todoLists[0].id);
      }
    } catch (error) {
      View.renderError(error, this.mainContainer);
    }
  }

  renderHeader(header) {
    this.listSelector = View.createAndAppend('select', header, { class: 'todo-list-selector' });
    this.listSelector.addEventListener('change', event => {
      this.model.loadTodoItems(event.target.value);
    });
    const button = View.createAndAppend('button', header, {
      text: 'ADD TODO',
      class: 'button',
    });
    button.addEventListener('click', () => this.todoEditModal.edit());
  }

  renderListSelectorContent() {
    View.clearContainer(this.listSelector);
    this.model.todoLists.forEach(list => {
      View.createAndAppend('option', this.listSelector, {
        value: list.id,
        text: list.description,
      });
    });
  }

  handleEdit(todo) {
    this.todoEditModal.edit(todo);
  }

  renderTodoItems() {
    View.clearContainer(this.todoListContainer);
    this.model.todoItems
      .map(todo => new TodoListItem(todo, this.model, () => this.handleEdit(todo)))
      .forEach(todoListItem => todoListItem.render(this.todoListContainer));
  }

  update(action) {
    switch (action) {
      case Model.TODO_LISTS_FETCHED:
        this.renderListSelectorContent();
        break;
      case Model.TODO_ITEMS_FETCHED:
        this.renderTodoItems();
        break;
      case Model.FETCH_ERROR:
        View.renderError(this.model.lastError, this.mainContainer);
        break;
      default:
        console.error(`Unknown action: ${action}`);
    }
  }
}
