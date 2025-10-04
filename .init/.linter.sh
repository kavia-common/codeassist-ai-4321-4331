#!/bin/bash
cd /home/kavia/workspace/code-generation/codeassist-ai-4321-4331/frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

