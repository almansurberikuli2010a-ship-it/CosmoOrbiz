#!/bin/bash
# Фронтенд в режиме разработки (http://localhost:5173). Node.js лежит в ~/.local/node.
export PATH="$HOME/.local/node/bin:$PATH"
cd "$(dirname "$0")/../web" && exec npm run dev -- --port 5173 --strictPort
