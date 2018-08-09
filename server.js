<<<<<<< HEAD
const http = require('http');

const hostname = 'xyvybot.herokuapp.com';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
=======
const http = require('http');

const hostname = 'xyvybot.herokuapp.com';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
>>>>>>> 17dd4339f33881709bf8603c2ed8c3af2a6ff225
});