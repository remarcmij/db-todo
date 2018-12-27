'use strict';

// eslint-disable-next-line no-unused-vars
class Observer {
  constructor() {
    this.observers = new Set();
  }

  subscribe(observer) {
    if (typeof observer.update === 'function') {
      this.observers.add(observer);
      return () => this.observers.delete(observer);
    } else {
      throw new Error('Subscriber must implement update function');
    }
  }

  notify(action) {
    console.log(action);
    this.observers.forEach(observer => observer.update(action));
  }
}
