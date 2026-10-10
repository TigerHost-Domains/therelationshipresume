import { createServer } from 'node:http'
import * as serverEntry from './dist/server/server.js'

const port = process.env.PORT || 10000

// Locate the request handler function from the exported module bundle
const handleRequest = serverEntry.default || serverEntry.handler || serverEntry

const server = createServer(async (req, res) => {
  try {
    if (typeof handleRequest === 'function') {
      await handleRequest(req, res)
    } else {
      // Fallback if Vinxi wrapped it differently
      res.statusCode = 500
      res.end('Server handler not found')
    }
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`)
})