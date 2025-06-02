// First log the raw env variables before loading .env
console.log('\n=== Pre-dotenv Environment Variables ===');
console.log('TARGET_GROUP_NAME:', process.env.TARGET_GROUP_NAME);
console.log('============================\n');

require('dotenv').config();
const fetch = require('node-fetch');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

// Debug environment variables after loading .env
console.log('\n=== Post-dotenv Environment Variables ===');
console.log('TARGET_GROUP_NAME from env:', process.env.TARGET_GROUP_NAME);
console.log('Current working directory:', process.cwd());
console.log('Env file exists:', fs.existsSync('./.env'));
try {
    console.log('Env file contents:', fs.readFileSync('./.env', 'utf8'));
} catch (error) {
    console.log('Error reading .env file:', error.message);
}
console.log('============================\n');

// Get target group name from environment variables
const TARGET_GROUP_NAME = process.env.TARGET_GROUP_NAME || "AgenticTest";
console.log('Final TARGET_GROUP_NAME being used:', TARGET_GROUP_NAME);

let targetGroupId = null;

// Helper function to get response from Gemini
async function getGeminiResponse(message) {
    try {
        console.log('Requesting response from Gemini for:', message);
        
        const API_KEY = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
        
        // Add context to the prompt
        const prompt = `You are a helpful WhatsApp group assistant. Please provide a concise and relevant response to this message: "${message}"

Rules:
1. Keep responses under 200 words
2. Be helpful and friendly
3. If you don't know something, say so
4. Don't include any harmful or inappropriate content
5. Format the response for WhatsApp (use emojis sparingly)`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        };

        console.log('Making request to Gemini API with URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);

        const data = await response.json();
        console.log('Full API response:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}\n${JSON.stringify(data, null, 2)}`);
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        console.log('Generated text:', generatedText);
        return generatedText;

    } catch (error) {
        console.error('Error getting response from Gemini:', error);
        console.error('Full error details:', error.message);
        return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment.";
    }
}

// Initialize WhatsApp client with better authentication
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot",
        dataPath: "./whatsapp-sessions"
    }),
    puppeteer: {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Create sessions directory if it doesn't exist
if (!fs.existsSync('./whatsapp-sessions')) {
    fs.mkdirSync('./whatsapp-sessions');
}

// Find the target group ID when the client is ready
client.on('ready', async () => {
    console.log('WhatsApp bot is ready! The session has been saved.');
    
    try {
        // Get all groups
        const groups = await client.getChats();
        console.log('\nScanning available groups:');
        
        let foundGroups = 0;
        for (let chat of groups) {
            if (chat.isGroup) {
                foundGroups++;
                console.log(`- Found group: "${chat.name}" (ID: ${chat.id._serialized})`);
                if (chat.name === TARGET_GROUP_NAME) {
                    targetGroupId = chat.id._serialized;
                    console.log(`✓ Target group "${TARGET_GROUP_NAME}" found with ID: ${targetGroupId}`);
                }
            }
        }
        
        console.log(`\nTotal groups found: ${foundGroups}`);
        
        if (!targetGroupId) {
            console.log(`\n⚠️ Warning: Could not find group named "${TARGET_GROUP_NAME}". Please make sure:`);
            console.log('1. The group exists');
            console.log('2. You are a member of the group');
            console.log('3. The group name matches exactly (case-sensitive)');
            console.log('\nAvailable group names:');
            groups.forEach(chat => {
                if (chat.isGroup) {
                    console.log(`- "${chat.name}"`);
                }
            });
        } else {
            console.log('\n✓ Bot is ready to respond to messages in the target group!');
        }
    } catch (error) {
        console.error('Error finding target group:', error);
    }
});

// Handle incoming messages
client.on('message', async (message) => {
    const startTime = Date.now();
    console.log('\n--- New Message Received ---');
    
    try {
        const chat = await message.getChat();
        
        // Enhanced message details logging
        const messageDetails = {
            timestamp: new Date().toISOString(),
            from: message.from,
            body: message.body,
            isGroup: chat.isGroup,
            groupName: chat.isGroup ? chat.name : 'N/A',
            groupId: chat.isGroup ? chat.id._serialized : 'N/A',
            author: message.author || 'N/A',
            targetGroupId: targetGroupId,
            isTargetGroup: chat.isGroup && chat.id._serialized === targetGroupId,
            messageType: message.type,
            hasMedia: message.hasMedia
        };
        
        console.log('Detailed message info:', JSON.stringify(messageDetails, null, 2));

        // Skip status messages
        if (message.from === 'status@broadcast') {
            console.log('⚠️ Skipping status broadcast message');
            return;
        }

        // Debug group matching
        if (chat.isGroup) {
            console.log('\n=== Group Matching Debug ===');
            console.log('Received message from group:', chat.name);
            console.log('Target group name:', TARGET_GROUP_NAME);
            console.log('Names match:', chat.name === TARGET_GROUP_NAME);
            console.log('Group ID received:', chat.id._serialized);
            console.log('Target group ID:', targetGroupId);
            console.log('IDs match:', chat.id._serialized === targetGroupId);
            console.log('=========================\n');
        }

        // Check if message is from the target group
        if (chat.isGroup && chat.id._serialized === targetGroupId) {
            console.log(`✓ Message is from target group "${TARGET_GROUP_NAME}"`);
            
            // Don't respond to empty messages or media without caption
            if (!message.body) {
                console.log('⚠️ Skipping empty message or media without caption');
                return;
            }

            // Don't respond to messages from the bot itself
            if (message.fromMe) {
                console.log('⚠️ Skipping message from bot itself');
                return;
            }

            console.log('Processing message:', message.body);
            
            // Get response from Gemini
            const response = await getGeminiResponse(message.body);
            console.log('Generated response:', response);
            
            // Add a small random delay (0.5-1.5 seconds) to make it feel more natural
            const delay = Math.floor(Math.random() * 1000) + 500;
            console.log(`Waiting ${delay}ms before responding...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Send the response
            await message.reply(response);
            
            const endTime = Date.now();
            console.log(`✓ Response sent successfully! (Total processing time: ${endTime - startTime}ms)`);
        } else {
            console.log('⚠️ Message is not from target group, ignoring');
            if (chat.isGroup) {
                console.log(`Message was from group: "${chat.name}" (ID: ${chat.id._serialized})`);
                console.log(`Expected group: "${TARGET_GROUP_NAME}" (ID: ${targetGroupId})`);
                console.log('Group name comparison:', {
                    receivedName: chat.name,
                    targetName: TARGET_GROUP_NAME,
                    namesMatch: chat.name === TARGET_GROUP_NAME,
                    receivedNameLength: chat.name.length,
                    targetNameLength: TARGET_GROUP_NAME.length,
                    receivedNameChars: [...chat.name].map(c => c.charCodeAt(0)),
                    targetNameChars: [...TARGET_GROUP_NAME].map(c => c.charCodeAt(0))
                });
            }
        }
    } catch (error) {
        console.error('❌ Error handling message:', error);
        console.error('Error stack:', error.stack);
    }
    
    console.log('--- Message Processing Complete ---\n');
});

// Handle authentication failures
client.on('auth_failure', (error) => {
    console.error('❌ Authentication failed:', error);
    console.log('Please delete the ./whatsapp-sessions folder and try again.');
});

client.on('disconnected', (reason) => {
    console.log('❌ Client was disconnected:', reason);
});

// Initialize the client
console.log('\n=== Starting WhatsApp Bot ===');
console.log(`Target Group: "${TARGET_GROUP_NAME}"`);
console.log('If this is your first time, WhatsApp Web will open in a browser window.');
console.log('Please log in to WhatsApp Web when the browser opens.\n');

client.initialize(); 