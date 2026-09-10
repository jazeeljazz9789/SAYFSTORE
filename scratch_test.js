import express from 'express';
import { Readable } from 'stream';

const app = express();
app.use(express.json());
app.post('/', (req, res) => {
  res.json({ success: true, body: req.body });
});

const req = new Readable();
req.push(JSON.stringify({ test: 1 }));
req.push(null);
req.method = 'POST';
req.url = '/';
req.headers = {
  'content-type': 'application/json',
  'content-length': '11'
};

// Simulate Vercel parsing the body
req.body = { test: 1 };
// Vercel consumes the stream but doesn't set req._body
req.read(); // Consume stream

const res = {
  setHeader: () => {},
  end: (data) => console.log('Response:', data),
  statusCode: 200,
  once: () => {}
};

app(req, res, (err) => {
  console.log('Error or Next:', err);
});
console.log('Request sent through Express app');
