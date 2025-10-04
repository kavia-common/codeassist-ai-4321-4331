# Page snapshot

```yaml
- generic [ref=e3]:
  - banner "Application Header" [ref=e4]:
    - generic [ref=e5]:
      - heading "AI Copilot" [level=1] [ref=e6]
      - generic "Connected to http://localhost:3001" [ref=e7]:
        - text: Connected to http://localhost:3001
        - button "Diagnostics" [ref=e9] [cursor=pointer]
  - main "Chat conversation" [ref=e10]:
    - generic [ref=e11]:
      - article "Assistant message" [ref=e12]:
        - paragraph [ref=e13]: Hello! I’m your AI Copilot. Choose a mode and tell me how I can help.
      - article "User message" [ref=e14]:
        - paragraph [ref=e15]: Write a hello world in JS
      - article "Assistant message" [ref=e16]:
        - paragraph [ref=e17]: Sorry, I couldn't process that request.
        - paragraph
        - code [ref=e19]: Request failed with status 500
    - alert [ref=e20]: Request failed with status 500
  - form "Chat input" [ref=e21]:
    - generic [ref=e22]: Mode
    - combobox "Select action mode" [ref=e23]:
      - option "Generate" [selected]
      - option "Explain"
      - option "Debug"
    - generic [ref=e24]: Enter your message
    - textbox "Enter your message" [ref=e25]
    - button "Send" [disabled] [ref=e26]
```