'use strict';
/* global Model, TodoListItem, TodoEditModal, Helper */

// eslint-disable-next-line no-unused-vars
class View {
  constructor(model) {
    this.model = model;
    this.model.subscribe(this);
  }

  renderPage() {
    const root = document.getElementById('root');
    this.renderHeader(root);
    this.mainContainer = Helper.createAndAppend('div', root);
    this.todoListContainer = Helper.createAndAppend('ul', this.mainContainer);

    this.todoEditModal = new TodoEditModal(todo => this.model.saveTodo(todo));
    this.todoEditModal.render(this.mainContainer);
  }

  renderError(error) {
    Helper.clearContainer(this.mainContainer);
    Helper.createAndAppend('div', this.mainContainer, {
      text: error.message,
      class: 'alert alert-error',
    });
  }

  renderHeader(root) {
    const header = Helper.createAndAppend('header', root, { class: 'header' });
    this.listSelector = Helper.createAndAppend('select', header, { class: 'todo-list-selector' });
    this.listSelector.addEventListener('change', event => {
      this.model.loadTodoItems(event.target.value);
    });
    const button = Helper.createAndAppend('button', header, {
      text: 'ADD TODO',
      class: 'button',
    });
    button.addEventListener('click', () => this.todoEditModal.edit());
  }

  updateListSelectorContent(todoLists) {
    Helper.clearContainer(this.listSelector);
    todoLists.forEach(list => {
      Helper.createAndAppend('option', this.listSelector, {
        value: list.id,
        text: list.description,
      });
    });
  }

  updateTodoItems(todoItems) {
    Helper.clearContainer(this.todoListContainer);
    todoItems
      .map(todo => new TodoListItem(todo, this.model, () => this.todoEditModal.edit(todo)))
      .forEach(todoListItem => todoListItem.render(this.todoListContainer));
  }

  update(action) {
    switch (action.type) {
      case Model.TODO_LISTS_FETCHED:
        this.updateListSelectorContent(action.payload);
        break;
      case Model.TODO_ITEMS_FETCHED:
        this.updateTodoItems(action.payload);
        break;
      case Model.FETCH_ERROR:
        this.renderError(action.payload);
        break;
      default:
        console.error(`Unknown action: ${action}`);
    }
  }
}
