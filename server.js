// server.js
import express from 'express';
import bodyParser from 'body-parser';
import handler from './api/index.js';

const app = express();
app.use(bodyParser.json());

app.post('/callback', handler);

// 測試一下根路徑
app.get('/', (req, res) => {
    res.send('Hello, LINE bot!');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
