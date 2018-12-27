'use strict';
/* global Store, TodoListItem, TodoEditModal, ConfirmDialog, Helper */

// eslint-disable-next-line no-unused-vars
class View {
  constructor(store) {
    this.store = store;
    this.store.subscribe(this);
  }

  renderPage() {
    const root = document.getElementById('root');
    this.renderHeader(root);
    this.mainContainer = Helper.createAndAppend('div', root);
    this.todoListContainer = Helper.createAndAppend('ul', this.mainContainer);

    this.todoEditModal = new TodoEditModal(this.store, this.mainContainer);
    this.todoEditModal.render();

    this.confirmDialog = new ConfirmDialog(this.mainContainer);
    this.confirmDialog.render();
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
      this.store.loadTodoItems(event.target.value);
    });
    Helper.createAndAppend('button', header, {
      text: 'ADD TASK',
      class: 'button',
    }).addEventListener('click', () => this.store.editTodo());
  }

  async handleDeleteTodo(todo) {
    const confirmed = await this.confirmDialog.confirm(`Delete task '${todo.description}'?`);
    if (confirmed) {
      this.store.deleteTodo(todo);
    }
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
      .map(
        todo =>
          new TodoListItem({
            todo,
            onSave: () => this.store.saveTodo(todo),
            onDelete: () => this.handleDeleteTodo(todo),
            onEdit: () => this.store.editTodo(todo),
          }),
      )
      .forEach(todoListItem => todoListItem.render(this.todoListContainer));
  }

  update(action) {
    switch (action.type) {
      case Store.TODO_LISTS_FETCHED:
        this.updateListSelectorContent(action.payload);
        break;
      case Store.TODO_ITEMS_FETCHED:
        this.updateTodoItems(action.payload);
        break;
      case Store.FETCH_ERROR:
        this.renderError(action.payload);
        break;
    }
  }
}
