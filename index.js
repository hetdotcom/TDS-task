const express = require('express');
const app = express();
app.use(express.json());

const dbConnect = require('./Database/dbConnect');
dbConnect();

const message = require('./Messages');
const config = require('./Config/config');

/// ////////////////////////////////* Morgan */////////////////////////////////
const morgan = require('morgan');
morgan.token('splitter', () => {
  return '\x1b[36m--------------------------------------------\x1b[0m\n';
});
morgan.token('statusColor', (_, res) => {
  const status = (
    typeof res.headersSent !== 'boolean' ? Boolean(res.header) : res.headersSent
  )
    ? res.statusCode
    : undefined;

  const color =
    status >= 500
      ? 31 // red
      : status >= 400
        ? 33 // yellow
        : status >= 300
          ? 36 // cyan
          : status >= 200
            ? 32 // green
            : 0; // no color

  return '\x1b[' + color + 'm' + status + '\x1b[0m';
});
app.use(
  morgan(
    ':splitter\x1b[33m:method\x1b[0m \x1b[36m:url\x1b[0m :statusColor :response-time ms - length|:res[content-length]'
  )
);

/// ////////////////////////////////* CORS */////////////////////////////////
const cors = require('cors');
app.use(
  cors({
    origin: '*'
  })
);

/// //////////////////////////////* HealthCheck *////////////////////////////////
app.get('/ping', async (_, res) => {
  try {
    res
      .status(message.status.statusSuccess)
      .json(message.messages.healthCheckPass);
  } catch (error) {
    res.status(message.status.badrequest).json(message.messages.healthCheckFail);
  }
});

/// ////////////////////////////* Routes for Users ///////////////////////////
app.use('/api/users', require('./Routes/userRoutes'));

/// ///////////////////////* Error Handling Routes *//////////////////////////
app.all('*', (_, res) => {
  return res.status(message.status.notFound).json(message.messages.notFound);
});

app.listen(config.PORT || 4444, () => {
  console.log('Server started listening on http://127.0.0.1:' + config.PORT);
});
