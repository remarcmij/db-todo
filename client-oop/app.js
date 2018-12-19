'use strict';
/* global Model, View */

{
  async function main() {
    const model = new Model();
    const view = new View(model);
    view.renderPage();

    try {
      await model.loadTodoLists();
      if (model.todoLists.length !== 0) {
        await model.loadTodoItems(model.todoLists[0].id);
      }
    } catch (error) {
      view.renderError(error);
    }
  }

  window.onload = main;
}
