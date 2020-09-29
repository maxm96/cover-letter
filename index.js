const express = require('express')
const port = 3000

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(port)

console.log(`Listening at http://localhost:${port}`)
