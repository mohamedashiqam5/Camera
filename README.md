# Permission-based iPhone ↔ Android Live Camera

## What it does
- One shared HTTPS link.
- Android user chooses **Start Camera** and explicitly grants camera/microphone permission.
- iPhone user chooses **Watch Live**.
- Video is peer-to-peer using WebRTC; the Node server is only a signaling relay.

## Deploy
This app needs a server that supports long-lived WebSocket connections (for example a Node host such as Render, Railway, Fly.io, or a VPS).

1. Upload this folder/repository to your hosting provider.
2. Set the start command to `npm start`.
3. Use the HTTPS URL supplied by the host.
4. Open that same URL on both phones.
5. Android: Start Camera → Allow.
6. iPhone: Watch Live.

## Important
- HTTPS is required by mobile browsers for getUserMedia.
- The Android user must actively grant permission.
- Keep the Android camera page open.
- This uses a public STUN server. Some restrictive networks may require a TURN server for reliable connections. For production use, add a TURN service to the `iceServers` arrays in camera.html and viewer.html.
- This starter does not record or store the video on the server.
