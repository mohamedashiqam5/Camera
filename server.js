import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = new Map();

// Serve files from /public
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

function roomSet(room) {
  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }

  return rooms.get(room);
}

wss.on("connection", (ws) => {
  let room = null;

  ws.on("message", (raw) => {
    let msg;

    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "join" && typeof msg.room === "string") {
      room = msg.room
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 80);

      if (!room) return;

      roomSet(room).add(ws);

      for (const peer of roomSet(room)) {
        if (peer !== ws && peer.readyState === 1) {
          peer.send(JSON.stringify({
            type: "peer-joined"
          }));
        }
      }

      return;
    }

    if (!room) return;

    for (const peer of roomSet(room)) {
      if (peer !== ws && peer.readyState === 1) {
        peer.send(JSON.stringify(msg));
      }
    }
  });

  ws.on("close", () => {
    if (room && rooms.has(room)) {
      rooms.get(room).delete(ws);

      if (rooms.get(room).size === 0) {
        rooms.delete(room);
      }
    }
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Listening on ${port}`);
});
