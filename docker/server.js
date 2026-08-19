/**
 * GenOffice Web Server
 *
 * This server provides web access to GenOffice applications,
 * handling file uploads, serving static assets, and managing sessions.
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
}

// Simple router
const routes = {
  '/': serveIndex,
  '/health': serveHealth,
  '/api': serveAPI,
  '/static': serveStatic,
}

function serveHealth(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }))
}

function serveIndex(req, res) {
  // Serve the main shell application
  const indexPath = path.join(__dirname, 'apps', 'shell', 'src', 'renderer', 'index.html')

  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  } else {
    // Fallback welcome page
    const welcomeHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GenOffice Web</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .app-list {
            list-style: none;
            padding: 0;
          }
          .app-list li {
            margin: 10px 0;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 4px;
          }
          .status {
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 GenOffice Web</h1>
          <p>Welcome to GenOffice Web Preview!</p>
          <p>The web version is currently being configured. Please check back soon or use the desktop version.</p>
          
          <h2>Available Applications:</h2>
          <ul class="app-list">
            <li>📄 <strong>Docs</strong> - Word processor with .docx support</li>
            <li>📊 <strong>Sheets</strong> - Spreadsheet editor with .xlsx support</li>
            <li>📽️ <strong>Slides</strong> - Presentation editor with .pptx support</li>
            <li>📕 <strong>PDF</strong> - PDF viewer and editor</li>
            <li>📝 <strong>Markdown</strong> - Markdown editor</li>
          </ul>
          
          <div class="status">
            <p><strong>Status:</strong> Server running on port ${PORT}</p>
            <p><strong>Version:</strong> 0.6.0 (Web Preview)</p>
          </div>
        </div>
      </body>
      </html>
    `
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(welcomeHtml)
  }
}

function serveAPI(req, res) {
  const url = new URL(req.url, `http://${HOST}:${PORT}`)

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      message: 'GenOffice API',
      version: '0.6.0',
      endpoints: {
        health: '/health',
        upload: '/api/upload',
        download: '/api/download',
        convert: '/api/convert',
      },
    }),
  )
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${HOST}:${PORT}`)
  const filePath = path.join(__dirname, url.pathname)
  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500)
        res.end('Error reading file')
        return
      }
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data)
    })
  } else {
    res.writeHead(404)
    res.end('File not found')
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`)
  const pathname = url.pathname

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Route request
  let handled = false
  for (const [route, handler] of Object.entries(routes)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      handler(req, res)
      handled = true
      break
    }
  }

  if (!handled) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found', path: pathname }))
  }
})

server.listen(PORT, HOST, () => {
  console.log(`🚀 GenOffice Web Server started`)
  console.log(`   Listening on http://${HOST}:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   Press Ctrl+C to stop`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('✅ Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT received. Shutting down gracefully...')
  server.close(() => {
    console.log('✅ Process terminated')
    process.exit(0)
  })
})
