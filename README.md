# WhatsApp AI Bot with Gemini Integration

A Node.js-based WhatsApp bot that uses Google's Gemini AI to automatically respond to messages in group chats.

## Features

- Connects to WhatsApp using whatsapp-web.js
- Integrates with Google's Gemini AI for intelligent responses
- Automatically responds to messages in specified group chats
- Persistent authentication using LocalAuth
- Clean and maintainable codebase

## Prerequisites

- Node.js (v14 or higher)
- A WhatsApp account
- Google Gemini API key
- Internet connection

## Project Structure

```
.
├── index.js           # Main bot implementation
├── package.json       # Node.js project configuration
├── package-lock.json  # Dependency lock file
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

## Setup

1. Clone this repository:
```bash
git clone https://github.com/bipinhcs11/Simple_Agentic_AI.git
cd Simple_Agentic_AI
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
TARGET_GROUP_NAME="Your Group Name"
GEMINI_API_KEY="your-gemini-api-key"
```
Replace "Your Group Name" with the exact name of your WhatsApp group and add your Gemini API key.

## Usage

1. Start the bot:
```bash
node index.js
```

2. When you run the bot for the first time, it will generate a QR code in the terminal.

3. Open WhatsApp on your phone:
   - Go to WhatsApp Settings > WhatsApp Web/Desktop
   - Tap "Link a Device"
   - Scan the QR code displayed in your terminal

4. Once connected, the bot will:
   - Monitor messages in the specified group
   - Process messages using Gemini AI
   - Send AI-generated responses automatically
   - Log all activities to the console

## Important Notes

- Keep your session active to maintain the connection
- The bot will only respond to messages in the group specified in your `.env` file
- Make sure your phone has a stable internet connection
- Don't sign out from WhatsApp Web on your phone, or you'll need to re-scan the QR code
- Keep your Gemini API key secure and never commit it to the repository

## Customizing AI Responses

The bot uses Google's Gemini AI for generating responses. You can customize the AI behavior by:

1. Modifying the prompt in `index.js`
2. Adjusting the Gemini API parameters
3. Adding custom logic for specific message types

## Troubleshooting

If you encounter issues:

1. Make sure your `.env` file has the correct group name and API key
2. Check that your WhatsApp is connected to the internet
3. Verify your Gemini API key is valid and has sufficient quota
4. Try deleting the `.wwebjs_cache` and `whatsapp-sessions` directories and re-scanning the QR code

## Contributing

Feel free to submit issues and enhancement requests! 