const util = require('util');
const mysql = require('mysql');

class MyConnection {
  constructor(connectionConfig) {
    this.connection = mysql.createConnection(connectionConfig);
    this.execQuery = util.promisify(this.connection.query.bind(this.connection));
  }

  end() {
    this.connection.end();
  }
}

module.exports = MyConnection;
