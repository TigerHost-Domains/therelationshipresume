import { createServer } from 'node:http'
import * as serverEntry from './dist/server/server.js'

// Ensure it defaults to 10000 if process.env.PORT isn't provided
const port = process.env.PORT || 10000

const handleRequest = serverEntry.createServerEntry || serverEntry.default?.default || serverEntry.default || serverEntry.handler

const server = createServer(async (req, res) => {
  try {
    if (typeof handleRequest === 'function') {
      await handleRequest(req, res)
    } else {
      res.statusCode = 500
      res.end('Server handler function not found.')
    }
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

// Explicitly bind to 0.0.0.0 and the correct port
server.listen(port, '0.0.0.0', () => {
  console.log(`Server successfully listening on port ${port}`)
})