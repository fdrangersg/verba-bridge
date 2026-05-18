const EventEmitter = require('events');
const { WebSocketServer, WebSocket } = require('ws');

class SubtitleHub extends EventEmitter {
  constructor(server) {
    super();
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (socket) => {
      this.emit('connection', this.wss.clients.size);

      socket.on('close', () => {
        this.emit('connection', this.wss.clients.size);
      });
    });
  }

  broadcast(type, payload) {
    const message = JSON.stringify({ type, payload });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  close() {
    this.wss.close();
  }
}

module.exports = SubtitleHub;
