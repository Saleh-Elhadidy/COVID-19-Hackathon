/**
 * Module dependencies.
 */
var fs = require('fs');
const http = require('http');
const https = require('https');
// var cert  = fs.readFileSync('/etc/letsencrypt/live/backend.taager.co/fullchain.pem', 'utf8');
// var privKey = fs.readFileSync('/etc/letsencrypt/live/backend.taager.co/privkey.pem', 'utf8');
// var options = {
//   key: privKey,
//   cert: cert
// };
const app = require('./app');
const {
  connectToMongoDB,
  disconnectFromMongoDB,
} = require('./config/mongoose');

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = val => {
  const port = Number(val);
  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
};

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

const onError = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
};

/**
 * Connect to database and listen on provided port, on all network interfaces.
 */

const bootstrapServer = async () => {
  await connectToMongoDB();
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
};

const closeServer = async () => {
  await new Promise((resolve, reject) => {
    server.close(err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
  await disconnectFromMongoDB();
};

module.exports = { bootstrapServer, closeServer };