# WhatsApp AI Bot

A Node.js-based WhatsApp bot that automatically responds to messages in group chats using AI.

## Features

- Connects to WhatsApp using whatsapp-web.js
- Automatically responds to messages in specified group chats
- Easy to integrate with AI models
- Persistent authentication using LocalAuth

## Prerequisites

- Node.js (v14 or higher)
- A WhatsApp account
- Internet connection

## Setup

1. Clone this repository:
```bash
git clone <your-repo-url>
cd whatsapp-ai-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
TARGET_GROUP_NAME="Your Group Name"
```
Replace "Your Group Name" with the exact name of your WhatsApp group.

## Usage

1. Start the bot:
```bash
npm start
```

2. When you run the bot for the first time, it will generate a QR code in the terminal.

3. Open WhatsApp on your phone:
   - Go to WhatsApp Settings > WhatsApp Web/Desktop
   - Tap "Link a Device"
   - Scan the QR code displayed in your terminal

4. Once connected, the bot will:
   - Monitor messages in the specified group
   - Automatically respond to messages
   - Log all activities to the console

## Important Notes

- Keep your session active to maintain the connection
- The bot will only respond to messages in the group specified in your `.env` file
- Make sure your phone has a stable internet connection
- Don't sign out from WhatsApp Web on your phone, or you'll need to re-scan the QR code

## Customizing Responses

To customize how the bot responds to messages, modify the `generateResponse` function in `src/index.js`. You can integrate any AI model or custom logic here.

## Troubleshooting

If you encounter issues:

1. Make sure your `.env` file has the correct group name
2. Check that your WhatsApp is connected to the internet
3. Ensure you're using the latest version of Node.js
4. Try deleting the `.wwebjs_auth` directory and re-scanning the QR code

## Contributing

Feel free to submit issues and enhancement requests! 