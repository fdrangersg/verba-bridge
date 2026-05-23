require('dotenv').config();

const fs = require('fs');
const fsp = require('fs/promises');
const http = require('http');
const path = require('path');

const config = require('./config');
const { isValidDirection } = require('./constants');
const { loadGlossaryFromCsv } = require('./glossary/glossaryLoader');
const GlossaryHints = require('./glossary/glossaryHints');
const GoogleTranslator = require('./translation/googleTranslator');
const SessionController = require('./session/sessionController');
const SubtitleHub = require('./websocket/subtitleHub');
const TranscriptRecorder = require('./recorder/transcriptRecorder');

const glossaryEntries = loadGlossaryFromCsv(config.glossaryPath);
const glossaryHints = new GlossaryHints(glossaryEntries);
const translator = new GoogleTranslator({
  projectId: config.translationProjectId,
  location: config.translationLocation,
  glossaryId: config.translationGlossaryId,
});
const sessionController = new SessionController({
  glossaryHints,
  translator,
  defaultDirection: config.defaultDirection,
  asrSampleRate: config.asrSampleRate,
  asrInterimResults: config.asrInterimResults,
  audioDevice: config.audioDevice,
  recordProgram: config.recordProgram,
});
const transcriptRecorder = new TranscriptRecorder({
  outputDir: config.recordingDir,
});

function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(body));
}

async function parseRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody.trim()) {
    return {};
  }

  return JSON.parse(rawBody);
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.html') {
    return 'text/html; charset=utf-8';
  }
  if (ext === '.js') {
    return 'application/javascript; charset=utf-8';
  }
  if (ext === '.css') {
    return 'text/css; charset=utf-8';
  }
  if (ext === '.json') {
    return 'application/json; charset=utf-8';
  }
  return 'text/plain; charset=utf-8';
}

async function serveStatic(reqPath, res) {
  const relativePath = reqPath === '/' ? '/index.html' : reqPath;
  const normalized = path.normalize(relativePath);
  const safePath = normalized.replace(/^([/\\])+/, '');
  const fullPath = path.join(config.staticDir, safePath);

  if (!fullPath.startsWith(config.staticDir)) {
    jsonResponse(res, 403, {
      error: 'Forbidden path.',
    });
    return;
  }

  try {
    const stat = await fsp.stat(fullPath);
    if (!stat.isFile()) {
      jsonResponse(res, 404, {
        error: 'Not found.',
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': getContentType(fullPath),
      'Cache-Control': 'no-cache',
    });

    fs.createReadStream(fullPath).pipe(res);
  } catch (error) {
    jsonResponse(res, 404, {
      error: 'Not found.',
    });
  }
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${config.port}`;
  const requestUrl = new URL(req.url || '/', `http://${host}`);
  const pathname = requestUrl.pathname;

  try {
    if (req.method === 'GET' && pathname === '/api/status') {
      jsonResponse(res, 200, sessionController.getStatus());
      return;
    }

    if (req.method === 'POST' && pathname === '/api/session/start') {
      const status = await sessionController.start();
      jsonResponse(res, 200, status);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/session/stop') {
      const status = await sessionController.stop();
      jsonResponse(res, 200, status);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/session/direction') {
      const body = await parseRequestBody(req);
      const direction = body.direction;

      if (!isValidDirection(direction)) {
        jsonResponse(res, 400, {
          error: 'Invalid direction. Use EN_TO_ZH or ZH_TO_EN.',
        });
        return;
      }

      const status = await sessionController.setDirection(direction);
      jsonResponse(res, 200, status);
      return;
    }

    if (req.method === 'GET') {
      await serveStatic(pathname, res);
      return;
    }

    jsonResponse(res, 404, {
      error: 'Not found.',
    });
  } catch (error) {
    jsonResponse(res, 500, {
      error: error.message || 'Unexpected server error.',
    });
  }
});

const subtitleHub = new SubtitleHub(server);

subtitleHub.on('connection', (count) => {
  subtitleHub.broadcast('connection', {
    count,
  });
  subtitleHub.broadcast('status', sessionController.getStatus());
});

sessionController.on('subtitle', (payload) => {
  transcriptRecorder.recordSubtitle(payload);
  subtitleHub.broadcast('subtitle', payload);
});

sessionController.on('interim', (payload) => {
  subtitleHub.broadcast('interim', payload);
});

sessionController.on('status', (payload) => {
  if (payload.running && !transcriptRecorder.isRecording()) {
    const filePath = transcriptRecorder.start({ direction: payload.direction });
    console.log(`Recording transcript to ${filePath}`);
  } else if (!payload.running && transcriptRecorder.isRecording()) {
    const closedPath = transcriptRecorder.stop();
    if (closedPath) {
      console.log(`Transcript saved: ${closedPath}`);
    }
  }
  subtitleHub.broadcast('status', payload);
});

sessionController.on('error', (payload) => {
  subtitleHub.broadcast('error', payload);
  console.error(payload.message);
});

server.listen(config.port, () => {
  console.log(`VerbaBridge server running on http://localhost:${config.port}`);
  console.log(`Default direction: ${config.defaultDirection}`);
});

async function shutdown() {
  try {
    await sessionController.stop();
  } catch (error) {
    console.error('Error while stopping session:', error.message);
  }

  transcriptRecorder.stop();
  subtitleHub.close();

  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
