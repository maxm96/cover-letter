const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')
const session = require('express-session')
const app = express()
const port = 3000


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Initialize Redis session store
const RedisStore = require('connect-redis')(session)
const RedisClient = redis.createClient(process.env.REDIS_URL || null)

// Create session parser
const sessionParser = session({
    store: new RedisStore({ client: RedisClient }),
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false,
})
app.use(sessionParser)

// Throw an error if we get a request without a session
app.use(function (req, res, next) {
    if (!req.session)
        return next(new Error('Request received without a session'))
    return next()
})

// Serve files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')))

// Use pug templating
app.set('view engine', 'pug')

// Instantiate controllers
const indexController = require('./src/controllers/index-controller')
const loginController = require('./src/controllers/login-controller')

// Routes
app.get('/', indexController.get)
app.get('/login', loginController.get)
app.post('/login', loginController.post)

const server = app.listen(port, () => console.log(`Listening at http://localhost:${port}`))

// Create websocket server
const sio = require('socket.io')(server)

// Parse the user session when they start a websocket connection
sio.use((socket, next) => sessionParser(socket.request, socket.request.res || {}, next))

// Game object
const Game = new (require('./src/models/Game'))(sio)

// Initialize socket events
require('./sockets')(sio, Game)