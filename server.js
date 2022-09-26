const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();

app.use(helmet());
app.use(compression());

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const { PORT = 3005 } = process.env;

app.listen(PORT);
