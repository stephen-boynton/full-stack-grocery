const mongoose = require('mongoose');

function connect() {
  try {
    mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });
  } catch (e) {
    console.error(e);
  }
}
module.exports = connect();
