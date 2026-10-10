import { createServer } from 'node:http'
import handler from './dist/server/server.js'

const port = process.env.PORT || 10000

const server = createServer(async (req, res) => {
  try {
    // Forward incoming requests to the TanStack Start handler
    await handler(req, res)
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`)
})