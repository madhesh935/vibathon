const http = require('http');

const data = JSON.stringify({
  message: "I am trapped in a burning building! {help me} we have 2 injuries."
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/triage',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
