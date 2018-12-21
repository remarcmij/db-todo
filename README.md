# db-todo

A simple todo application using Node.js, MySQL and a plain vanilla JavaScript web client.

There are three different client versions:

| Folder | Description                                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| simple | A version with hard-coded HTML for the unchanging part of the web page and JavaScript generated HTML for the changing parts.                                               |
| spa    | All HTML (except for an initial `root` div) is generated through JavaScript.                                                                                               |
| oop    | Similar to `spa`, but now using OOP, with a Store and a View. The View subscribes to the Store through an Observer pattern. The code is distributed across multiple files. |

## Installation

```
npm install
```

## Configuration

- Modify the database name and credentials in `/server/index.js`.
- Optionally, modify the database seed data in `/server/database/seed.json`.

## Start server

| Command                         | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `npm start` or<br>`npm run oop` | Starts the server with the `oop` client.    |
| `npm run simple`                | Starts the server with the `simple` client. |
| `npm run spa`                   | Starts the server with the `spa` client.    |

## Client

- Point your browser to: http://localhost:3000
