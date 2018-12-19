'use strict';
/* global Model, View */

{
  function main() {
    const model = new Model();
    const view = new View(model);
    view.initialize();
  }

  window.onload = main;
}
