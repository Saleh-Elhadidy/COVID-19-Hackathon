const mongoose = require('mongoose');
const { MONGO_URI } = process.env;

const connectToMongoDB = (uri = MONGO_URI) =>
  connection = mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })

const disconnectFromMongoDB = () => mongoose.disconnect();

module.exports = { connectToMongoDB, disconnectFromMongoDB };