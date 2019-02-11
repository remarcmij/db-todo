'use strict';

/* global Store, View */

{
  async function main() {
    const store = new Store();
    const view = new View(store);
    view.renderPage();

    try {
      await store.loadTodoLists();
      if (store.todoLists.length !== 0) {
        await store.loadTodoItems(store.todoLists[0].id);
      }
    } catch (error) {
      view.renderError(error);
    }
  }

  window.onload = main;
}
