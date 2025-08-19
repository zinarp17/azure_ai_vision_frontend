# Azure AI Vision Frontend — React demo for Vision APIs

https://github.com/zinarp17/azure_ai_vision_frontend/releases

[![Releases](https://img.shields.io/badge/Releases-Download-blue?style=for-the-badge&logo=github)](https://github.com/zinarp17/azure_ai_vision_frontend/releases)

![Azure Vision AI Illustration](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=8b3d1cfb3b3fd60c6f2dbb3f6a2b6f1f)

Fast, clear demo frontend that shows how to use Azure Vision AI APIs from a React single-page app. This repository focuses on patterns you can reuse: authentication, image upload, live preview, REST calls to Azure Vision, and result rendering.

Badges
- Build: [![Build Status](https://img.shields.io/github/actions/workflow/status/zinarp17/azure_ai_vision_frontend/ci.yml?branch=main&style=flat-square)](https://github.com/zinarp17/azure_ai_vision_frontend/actions)
- Releases: [![Releases](https://img.shields.io/badge/Releases-%E2%86%92%20Download-brightgreen?style=flat-square)](https://github.com/zinarp17/azure_ai_vision_frontend/releases)
- Topics: azure, azure-ai, azure-ai-vision, react

Key links
- Releases (download and run): https://github.com/zinarp17/azure_ai_vision_frontend/releases  
  Download the release package and execute the included installer or start script. The release contains a ready-to-run build (azure_ai_vision_frontend-vX.Y.Z.zip) and a small local server for demos.

Purpose
- Demonstrate end-to-end use of Azure Vision AI from a React frontend.
- Show how to call Vision APIs from client code and how to structure a secure workflow.
- Provide copy-paste components and hooks for image upload, analysis, and result display.

Who this helps
- Frontend engineers building demos for Azure Vision.
- Developers learning how to call Azure Vision REST endpoints from a SPA.
- Teams that need a quick reference for common Vision tasks: OCR, image tagging, object detection, and read API.

What you get
- React SPA scaffold (CRA / Vite).
- Core components: ImageUploader, VisionClient, ResultsPanel.
- Sample pages: Live Demo, Batch Test, Diagnostics.
- Example config for Azure endpoint + key.
- Dockerfile for local testing and a static build for deployment.

Features
- Image upload with drag & drop.
- Live preview and resize before upload.
- Single-call modes for Analyze, Read (OCR), and Object Detection.
- Async job polling for long-running operations.
- Config-driven: swap endpoints or models via env.
- Minimal dependencies. Focus on readability and reuse.

Quick demo screenshots
![Uploader](https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=0b58bd3f2b9f8f2b7c5f3b1f1a1e3a4d)
![Results](https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9a1a2f3e4b5c6d7e8f9a0b1c2d3e4f5a)

Quickstart (local)
1. Clone the repo
   - git clone https://github.com/zinarp17/azure_ai_vision_frontend.git
2. Install
   - cd azure_ai_vision_frontend
   - npm install
3. Configure
   - Copy .env.example to .env
   - Set REACT_APP_AZURE_ENDPOINT and REACT_APP_AZURE_KEY
4. Run
   - npm start
5. Open http://localhost:3000

If you prefer a packaged version, download the release and run the included bundle:
- Visit the Releases page and download the build: https://github.com/zinarp17/azure_ai_vision_frontend/releases  
- Extract the archive and run the provided start script (start.sh / start.cmd) or serve the static folder with a simple HTTP server.

Configuration
- .env variables
  - REACT_APP_AZURE_ENDPOINT=https://<your-resource-name>.cognitiveservices.azure.com/
  - REACT_APP_AZURE_KEY=<your-key>
  - REACT_APP_MODEL=latest (change to a specific model if required)
- The app reads config at runtime. You can also override values via a JSON config file (public/config.json).

Security model
- For demos, the app accepts a key in env. For production, use a server-side proxy or token exchange.
- The repository includes an example Express proxy (server/proxy.js) that accepts short-lived tokens from a secure backend and signs requests with the Azure key.

Core concepts and patterns
- VisionClient
  - Small wrapper around fetch. It signs requests when a key is present and retries transient failures.
  - Example usage:
    - analyzeImage(file, { features: ['Tags','Objects'] })
    - readImage(file) returns operation-location for async processing
- Polling pattern for Read API
  - Submit image, get operation ID, poll status until succeeded, then fetch results.
- Chunk upload
  - For large images or batch jobs, the app splits payloads and uploads in parallel.
- UI updates
  - The app uses optimistic UI for quick feedback: preview image, then replace with full analysis once results arrive.

Sample usage (conceptual)
- Upload image
  - User drags image onto ImageUploader.
  - The component shows preview and file info.
  - On confirm, the app calls VisionClient.analyzeImage.
- Show results
  - ResultsPanel renders tags, captions, detected objects, and OCR text.
  - The UI highlights bounding boxes on the preview canvas.

API notes (Azure Vision)
- Endpoints used
  - /vision/v3.2/analyze
  - /vision/v3.2/read/analyze
  - /vision/v3.2/detect
- For OCR(Read) the app uses the async Read API:
  - POST /vision/v3.2/read/analyze
  - Poll the operation-location header for results
- The frontend handles HTTP 429 by retrying with exponential backoff.
- Model versions
  - The code defaults to v3.2. You can change version in config.

Examples included
- OCR demo (read-demo)
  - Drop an image with text, get parsed blocks and words.
- Tagging demo (analyze-demo)
  - Get captions, tags, and confidence values.
- Object detection demo (detect-demo)
  - Show bounding boxes and labels.
- Batch mode
  - Upload multiple images and get aggregated results.

Developer notes
- Tech stack
  - React, TypeScript, Vite (or CRA fallback)
  - Minimal CSS with CSS modules
  - Small server written in Express for token exchange
- Tests
  - Basic unit tests for utils and VisionClient
  - End-to-end examples use Playwright for UI flows
- Linting
  - ESLint + Prettier configured in repo

Releases and distribution
- Download packaged versions and installers from Releases: https://github.com/zinarp17/azure_ai_vision_frontend/releases  
  The release contains a ZIP with a production build and a small server. After download, extract and execute the included run script:
  - Linux/macOS: ./start.sh
  - Windows: start.cmd

Troubleshooting
- If the app fails to call Azure
  - Verify REACT_APP_AZURE_ENDPOINT and REACT_APP_AZURE_KEY.
  - Check CORS: if you use a direct key in the client, ensure the resource accepts client origins or use the proxy.
- If Read API returns "not ready"
  - Poll for the operation result until status == "succeeded".
- If you hit rate limits
  - Use retries with backoff and batch requests where possible.

Contributing
- Open an issue for features or bugs.
- Fork, create a feature branch, and open a pull request.
- Follow the code style: TypeScript, functional components, hooks for side effects.
- Add tests for any new logic that touches VisionClient or parsing logic.

Roadmap
- Add live webcam capture and real-time OCR demo.
- Add adaptive UI for languages and right-to-left text.
- Add examples for custom Vision models and domain-specific training.

Repository structure (high level)
- src/
  - components/ (ImageUploader, ResultsPanel, CanvasOverlay)
  - hooks/ (usePoll, useFileReader)
  - lib/ (visionClient.ts, retries.ts)
  - pages/ (Demo, Batch, Diagnostics)
  - App.tsx
- server/
  - proxy.js (token exchange)
- public/
  - config.json
- docker/
  - Dockerfile
- README.md

License
- MIT. Use code freely in demos and internal projects. Include attribution where required by Azure terms.

Contact and support
- Open issues on GitHub for bugs or questions.
- For Azure account issues, use the Azure portal support channels.

Useful links
- Azure Vision docs: https://learn.microsoft.com/azure/cognitive-services/computer-vision/
- Releases: https://github.com/zinarp17/azure_ai_vision_frontend/releases

Community and topics
- This repo tags: azure, azure-ai, azure-ai-vision, azure-vision, azure-vision-api, azureai, azureaistudio, azurevision, azurevisionai, react, reactjs

License and contribution files live in the repository root.