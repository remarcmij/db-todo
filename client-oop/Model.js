'use strict';

// eslint-disable-next-line no-unused-vars
class Model {
  static fetchJSON(url, options = {}) {
    const fetchOptions = Object.assign(
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
      options,
    );
    return fetch(url, fetchOptions).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
    });
  }

  constructor() {
    this.observers = new Set();
    this.todoLists = [];
    this.todoItems = [];
    this.currentListId = 0;
    this.lastError = null;
  }

  subscribe(observer) {
    if (typeof observer.update === 'function') {
      this.observers.add(observer);
      return () => this.observers.delete(observer);
    } else {
      console.error("Can't subscribe observer without update function");
      return () => undefined;
    }
  }

  notify(action) {
    this.observers.forEach(observer => observer.update(action));
  }

  notifyError(error) {
    this.lastError = error;
    this.notify({ type: Model.FETCH_ERROR, payload: error });
  }

  notifyTodoItemsFetched() {
    this.notify({ type: Model.TODO_ITEMS_FETCHED, payload: this.todoItems });
  }

  async loadTodoLists() {
    try {
      this.lastError = null;
      this.todoLists = await Model.fetchJSON('/lists');
      this.notify({ type: Model.TODO_LISTS_FETCHED, payload: this.todoLists });
    } catch (error) {
      this.notifyError(error);
    }
  }

  async loadTodoItems(listId) {
    try {
      this.currentListId = listId;
      this.lastError = null;
      this.todoItems = await Model.fetchJSON(`/todos?listId=${this.currentListId}`);
      this.notifyTodoItemsFetched();
    } catch (error) {
      this.notifyError(error);
    }
  }

  async saveTodo(todo) {
    const todoData = Object.assign({}, todo, {
      due_date: todo.due_date ? todo.due_date.slice(0, 10) : null,
      list_id: todo.list_id || this.currentListId,
    });

    try {
      this.todoItems = await Model.fetchJSON(`/todos`, {
        method: todoData.id ? 'PATCH' : 'POST',
        body: JSON.stringify(todoData),
      });
      this.notifyTodoItemsFetched();
    } catch (error) {
      this.notifyError(error);
    }
  }

  async deleteTodo(todo) {
    try {
      this.todoItems = await Model.fetchJSON(`/todos/${todo.id}?listId=${this.currentListId}`, {
        method: 'DELETE',
      });
      this.notifyTodoItemsFetched();
    } catch (error) {
      this.notifyError(error);
    }
  }
}

Model.TODO_LISTS_FETCHED = 'TODO_LISTS_FETCHED';
Model.TODO_ITEMS_FETCHED = 'TODO_ITEMS_FETCHED';
Model.FETCH_ERROR = 'FETCH_ERROR';
