const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// LiteSpeed specific configuration
const app = next({ 
  dev, 
  hostname, 
  port,
  // Disable some features that might not work in shared hosting
  experimental: {
    // Disable features that require root access
    workerThreads: false,
    cpus: 1
  }
})

const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Add CORS headers for LiteSpeed
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
      }

      const parsedUrl = parse(req.url, true)
      
      // Log requests for debugging
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
      
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Lagiah Backend ready on http://${hostname}:${port}`)
      console.log(`> Environment: ${process.env.NODE_ENV}`)
      console.log(`> Port: ${port}`)
    })
}) 