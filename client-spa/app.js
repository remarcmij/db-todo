'use strict';

{
  const ui = {};
  const state = {};

  function createAndAppend(name, parent, options = {}) {
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

  function clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function renderError(error) {
    clearContainer(ui.mainContainer);
    createAndAppend('div', ui.mainContainer, { text: error.message, class: 'alert alert-error' });
  }

  function fetchJSON(url, options = {}) {
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

  async function saveTodo(todo) {
    const todoData = Object.assign({}, todo, {
      due_date: todo.due_date ? todo.due_date.slice(0, 10) : null,
      list_id: todo.list_id || state.listId,
    });

    const method = todoData.id ? 'PATCH' : 'POST';
    try {
      state.todos = await fetchJSON(`/todos`, {
        method,
        body: JSON.stringify(todoData),
      });
      updateTodoListItems();
    } catch (error) {
      renderError(error);
    }
  }

  function renderCheckbox(todo, parent) {
    const checkboxId = `todo-${todo.id}`;
    createAndAppend('label', parent, {
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
    const checkBox = createAndAppend('input', parent, checkboxOptions);
    checkBox.addEventListener('change', async () => {
      todo.done = todo.done === 'n' ? 'y' : 'n';
      saveTodo(todo);
    });
  }

  function renderButton(label, parent, clickHandler) {
    const button = createAndAppend('button', parent, {
      text: label,
      class: 'button',
    });
    button.addEventListener('click', clickHandler);
    return button;
  }

  function renderTodoDeleteButton(parent, todo) {
    renderButton('DELETE', parent, async () => {
      if (confirm('Deleting todo: please confirm')) {
        state.todos = await fetchJSON(`/todos/${todo.id}?listId=${state.listId}`, {
          method: 'DELETE',
        });
        updateTodoListItems();
      }
    });
  }

  function renderTodoListItem(todo) {
    const li = createAndAppend('li', ui.todoListContainer, { class: 'todo-list-item' });
    const containerDiv = createAndAppend('div', li, { class: 'todo-list-item-container' });

    createAndAppend('div', containerDiv, {
      text: todo.description,
      class: todo.done === 'y' ? 'todo-list-item-done' : '',
    });

    const rightPart = createAndAppend('div', containerDiv, { class: 'todo-list-item-right' });
    const dateString = todo.due_date ? new Date(todo.due_date).toLocaleDateString() : '';
    createAndAppend('div', rightPart, { text: dateString, class: 'todo-list-due-date' });

    renderTodoDeleteButton(rightPart, todo);
    renderButton('EDIT', rightPart, () => editTodo(todo));
    renderCheckbox(todo, rightPart);
  }

  function updateTodoListItems() {
    clearContainer(ui.todoListContainer);
    state.todos.forEach(todo => renderTodoListItem(todo));
  }

  function updateListSelectorContent() {
    clearContainer(ui.listSelector);
    state.todoLists.forEach(list => {
      createAndAppend('option', ui.listSelector, {
        value: list.id,
        text: list.description,
      });
    });
  }

  function updateSaveButtonState() {
    const text = ui.editModalTextInput.value;
    if (text.trim() === '') {
      ui.editModalSaveButton.setAttribute('disabled', '');
    } else {
      ui.editModalSaveButton.removeAttribute('disabled');
    }
  }

  function handleSave() {
    state.currentTodo.description = ui.editModalTextInput.value;
    state.currentTodo.due_date = ui.editModalDateInput.value;
    ui.editModalOverlay.style.display = 'none';
    saveTodo(state.currentTodo);
  }

  function renderEditModalDialog(parent) {
    ui.editModalOverlay = createAndAppend('div', parent, { class: 'modal' });
    const modalContent = createAndAppend('div', ui.editModalOverlay, { class: 'modal-content' });
    ui.editModalTitle = createAndAppend('div', modalContent, { class: 'modal-title' });
    const body = createAndAppend('div', modalContent, { class: 'modal-body' });

    ui.editModalTextInput = createAndAppend('input', body, {
      type: 'text',
      class: 'edit-text-input',
    });

    ui.editModalDateInput = createAndAppend('input', body, {
      type: 'date',
      class: 'edit-date-input',
    });

    const buttonContainer = createAndAppend('div', modalContent, {
      class: 'modal-buttons',
    });

    ui.editModalSaveButton = renderButton('SAVE', buttonContainer, handleSave);
    ui.editModalTextInput.addEventListener('input', () => updateSaveButtonState());

    window.onclick = event => {
      if (event.target === ui.editModalOverlay) {
        ui.editModalOverlay.style.display = 'none';
      }
    };
  }

  function editTodo(todo = {}) {
    state.currentTodo = todo;
    ui.editModalTitle.innerText = todo.id ? 'Edit Todo' : 'Add Todo';
    ui.editModalTextInput.value = todo.description || '';
    updateSaveButtonState();
    const dateString = todo.due_date ? todo.due_date.slice(0, 10) : '';
    ui.editModalDateInput.value = dateString;
    ui.editModalOverlay.style.display = 'block';
    ui.editModalTextInput.focus();
  }

  function renderHeader(root) {
    const header = createAndAppend('header', root, { class: 'header' });
    ui.listSelector = createAndAppend('select', header, { class: 'todo-list-selector' });
    ui.listSelector.addEventListener('change', event => {
      fetchAndRenderTodos(event.target.value);
    });
    const button = createAndAppend('button', header, {
      text: 'ADD TODO',
      class: 'button',
    });
    button.addEventListener('click', () => editTodo());
  }

  async function fetchAndRenderTodos(listId) {
    state.listId = listId;
    try {
      state.todos = await fetchJSON(`/todos?listId=${listId}`);
      updateTodoListItems();
    } catch (error) {
      renderError(error);
    }
  }

  async function main() {
    const root = document.getElementById('root');
    renderHeader(root);
    ui.mainContainer = createAndAppend('div', root);
    ui.todoListContainer = createAndAppend('ul', ui.mainContainer);
    renderEditModalDialog(ui.mainContainer);

    try {
      state.todoLists = await fetchJSON('/lists');
      updateListSelectorContent();
      fetchAndRenderTodos(state.todoLists[0].id);
    } catch (error) {
      renderError(error);
    }
  }

  window.onload = main;
}
