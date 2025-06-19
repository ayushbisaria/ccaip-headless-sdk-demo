import { Client } from "@ujet/websdk-headless";

// --- 1. CONFIGURATION (Will be fetched from server) ---
let ccaasConfig = {}; // Object to hold the fetched configuration


// --- 2. AUTHENTICATION ---
async function authenticate() {
    try {
        const resp = await fetch("http://localhost:3000/api/get-chat-token");
        if (!resp.ok) throw new Error('Failed to fetch auth token');
        console.log("Auth done");
        return await resp.json();
    } catch (error) {
        console.error("Authentication Error:", error);
        throw error;
    }
}

// --- Function to fetch ccaas configuration from your server ---
async function fetchCcaasConfig() {
    try {
        const resp = await fetch("http://localhost:3000/api/ccaas-config");
        if (!resp.ok) throw new Error('Failed to fetch ccaas configuration');
        ccaasConfig = await resp.json();
        console.log("Ujet Configuration fetched:", ccaasConfig);
    } catch (error) {
        console.error("Error fetching ccaas configuration:", error);
        throw error; // Re-throw to stop further execution if config is critical
    }
}

// --- Main application initialization function ---
async function initializeChatApp() {
    // Await fetching the configuration before proceeding
    try {
        await fetchCcaasConfig();
    } catch (error) {
        // Display an error message to the user if config fetching fails
        messagesDiv.innerHTML = '<div class="system-message">Error: Could not load chat configuration. Please try again later.</div>';
        console.error("Failed to initialize chat app due to configuration error.");
        return; // Stop initialization
    }

    // --- 3. CLIENT INITIALIZATION (using fetched config) ---
    const client = new Client({
        companyId: ccaasConfig.companyId,
        tenant: ccaasConfig.tenant,
        host: ccaasConfig.host,
        authenticate: authenticate,
    });

    // --- 4. UI ELEMENT HOOKS ---
    const startChatBtn = document.getElementById("startChatBtn");
    const chatWindow = document.getElementById("chatWindow");
    const sendMessageBtn = document.getElementById("send-message-btn");
    const attachmentInput = document.getElementById('attachment-input');
    const chatInput = document.getElementById("chat-input");
    const messagesDiv = document.getElementById("chat-messages");
    const closeChatBtn = document.getElementById("closeChatBtn"); // Assuming you have this ID in your HTML

    // Global variable to store the currently attached file
    let currentAttachedFile = null;

    // --- 5. CORE FUNCTIONS ---
    function startChat() {
        console.log("Attempting to create chat...");
        chatWindow.style.display = 'flex';
        startChatBtn.style.display = 'none';
        messagesDiv.innerHTML = '<div class="system-message">Connecting...</div>';
        // Use the menuId from the fetched configuration
        client.createChat(ccaasConfig.menuId)
            .catch(error => {
                console.error("Error creating chat:", error);
                messagesDiv.innerHTML = '<div class="system-message">Error: Could not start chat.</div>';
            });
    }

    // --- Updated sendMessage function ---
    function sendMessage(textParam) {
        // --- Prioritize sending file if one is attached ---
        if (currentAttachedFile) {
            console.log("Attempting to send file:", currentAttachedFile.name);

            const optimisticFileMessage = {
                file: { name: currentAttachedFile.name, type: currentAttachedFile.type },
                identity: {
                    is_customer: true,
                    display_name: 'You'
                }
            };
            appendMessage(optimisticFileMessage);

            client.sendFileMessage(currentAttachedFile)
                .then(() => {
                    console.log("File sent successfully!");
                })
                .catch(error => {
                    console.error("Error sending file message:", error);
                })
                .finally(() => {
                    currentAttachedFile = null;
                    attachmentInput.value = null;
                    chatInput.value = '';
                    chatInput.disabled = false;
                });

            return;
        }

        // --- If no file is attached, proceed with text message logic ---
        const messageText = textParam || chatInput.value.trim();

        if (messageText) {
            console.log("Message to be sent:", messageText);

            const optimisticMessage = {
                text: messageText,
                identity: {
                    is_customer: true,
                    display_name: 'You'
                }
            };
            appendMessage(optimisticMessage);

            if (!textParam) {
                chatInput.value = "";
            }

            client.sendTextMessage(messageText)
                .catch(error => {
                    console.error("Error sending text message:", error);
                });
        } else if (!textParam) {
            alert("Please type a message or select a file to send.");
        }
    }

    function appendMessage(message) {
        console.log(message)
        const p = document.createElement('p');
        p.classList.add('message-bubble');

        if (message.file) {
            p.classList.add('user');
            const fileName = message.file.name || 'Unknown File';
            const fileType = message.file.type || 'unknown';

            let fileDisplayContent = ``;

            if (fileType.startsWith('image/')) {
                fileDisplayContent = `🖼️ Image: <strong>${fileName}</strong>`;
            } else if (fileType.startsWith('video/')) {
                fileDisplayContent = `🎥 Video: <strong>${fileName}</strong>`;
            } else {
                fileDisplayContent = `📄 File: <strong>${fileName}</strong> (${fileType.split('/')[1] || fileType})`;
            }

            const senderName = (message.identity && message.identity.display_name) || 'You';
            p.innerHTML = `<strong>${senderName}:</strong> ${fileDisplayContent}`;

        }else if (message.type === 'content_card' && message.cards) {
            p.classList.add('agent');

            const senderName = (message.identity && message.identity.display_name) || 'Agent';
            const cardsContainer = document.createElement('div');
            cardsContainer.classList.add('content-cards-container');

            message.cards.forEach(cardData => {
                const card = document.createElement('div');
                card.classList.add('content-card');

                if (cardData.images && cardData.images.length > 0) {
                    const img = document.createElement('img');
                    img.src = cardData.images[0];
                    img.alt = cardData.title || 'Card Image';
                    card.appendChild(img);
                }

                if (cardData.title) {
                    const title = document.createElement('h3');
                    title.textContent = cardData.title;
                    card.appendChild(title);
                }

                if (cardData.subtitle) {
                    const subtitle = document.createElement('p');
                    subtitle.classList.add('content-card-subtitle');
                    subtitle.textContent = cardData.subtitle;
                    card.appendChild(subtitle);
                }

                if (cardData.body) {
                    const body = document.createElement('p');
                    body.classList.add('content-card-body');
                    body.textContent = cardData.body;
                    card.appendChild(body);
                }

                if (cardData.link) {
                    const link = document.createElement('a');
                    link.href = cardData.link;
                    link.textContent = 'Learn More';
                    link.target = '_blank';
                    card.appendChild(link);
                }

                if (cardData.buttons && cardData.buttons.length > 0) {
                    const cardButtonGroup = document.createElement('div');
                    cardButtonGroup.classList.add('button-group');

                    cardData.buttons.forEach(buttonData => {
                        const button = document.createElement('button');
                        button.classList.add('chat-button', `button-style-${buttonData.style || 'default'}`);
                        button.textContent = buttonData.title;

                        button.addEventListener('click', () => {
                            console.log(`Content Card Button '${buttonData.title}' clicked!`);
                            if (buttonData.auto_reply) {
                                console.log(`Sending '${buttonData.title}' as a reply.`);
                                const userResponseP = document.createElement('p');
                                userResponseP.classList.add('message-bubble', 'user');
                                userResponseP.textContent = buttonData.title;
                                messagesDiv.appendChild(userResponseP);
                                messagesDiv.scrollTop = messagesDiv.scrollHeight;

                                cardButtonGroup.querySelectorAll('.chat-button').forEach(btn => btn.disabled = true);

                                client.sendTextMessage(buttonData.title)
                                    .catch(error => {
                                        console.error("Error sending text message:", error);
                                    });
                            } else {
                                console.log("This button does not auto-reply.");
                            }
                        });
                        cardButtonGroup.appendChild(button);
                    });
                    card.appendChild(cardButtonGroup);
                }
                cardsContainer.appendChild(card);
            });
            p.innerHTML = `<strong>${senderName}:</strong>`;
            p.appendChild(cardsContainer);

        } else if (message.type === 'inline_button' && message.buttons) {
            p.classList.add('agent');

            let html = `<strong>${(message.identity && message.identity.display_name) || 'Agent'}</strong>`;
            if (message.title) {
                html += `<div>${message.title}</div>`;
            }

            const buttonGroup = document.createElement('div');
            buttonGroup.classList.add('button-group');

            message.buttons.forEach(buttonData => {
                const button = document.createElement('button');
                button.classList.add('chat-button');
                button.textContent = buttonData.title;

                button.addEventListener('click', () => {
                    console.log(`Button '${buttonData.title}' clicked! Sending '${buttonData.title}' as a reply.`);

                    const userResponseP = document.createElement('p');
                    userResponseP.classList.add('message-bubble', 'user');
                    userResponseP.textContent = buttonData.title;
                    messagesDiv.appendChild(userResponseP);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;

                    buttonGroup.querySelectorAll('.chat-button').forEach(btn => btn.disabled = true);

                    client.sendTextMessage(buttonData.title)
                        .catch(error => {
                            console.error("Error sending text message:", error);
                        });
                });

                buttonGroup.appendChild(button);
            });

            p.innerHTML = html;
            p.appendChild(buttonGroup);

        } else {
            if (message.identity && message.identity.is_customer) {
                p.classList.add('user');
                p.textContent = message.text || message.content;
            } else {
                p.classList.add('agent');
                const senderName = (message.identity && message.identity.display_name) || 'Agent';
                p.innerHTML = `<strong>${senderName}:</strong> ${message.text || message.content}`;
            }
        }

        messagesDiv.appendChild(p);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }


    // --- 6. SDK EVENT LISTENERS ---
    client.on("ready", () => {
        console.log("**** client is ready****")
    })

    client.on("chat.connected", () => {
        console.log("Chat connected.");
        messagesDiv.innerHTML = '';
        const systemMessage = document.createElement('div');
        systemMessage.classList.add('system-message');
        systemMessage.textContent = 'Chat session started';
        messagesDiv.appendChild(systemMessage);
        
        client.fetchMessages().then(messages => {
            messages.forEach(appendMessage);
        });
    });

    client.on("chat.memberJoined", (identity) => {
      console.log(identity)
    })

    client.on('chat.ongoing', (chat) => {
        console.log("Ongoing chat detected:", chat);
    });

    client.on("chat.updated", (chat) => {
        console.log("Updated chat:", chat);
        if (chat.state.status && chat.connected && chat.state.status_text) {
            console.log("Info: %s",chat.state.status);
            const systemMessage = document.createElement('div');
            systemMessage.classList.add('system-message');
            const rawStatusText = chat.state.status_text;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = rawStatusText;
            const cleanStatusText = tempDiv.textContent || tempDiv.innerText || "";
            systemMessage.textContent = cleanStatusText;
            messagesDiv.appendChild(systemMessage);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });

    client.on("chat.message", (message) => {
        console.log("Event: chat.message", message);
        if (message.$userType === 'end_user') {
            console.log("Info: Ignoring echo of user's own message.");
            return;
        }
        if (message.type === 'noti' && message.event === 'escalationStarted') {
            console.log("Info: Human escalation started..");
            return;
        }
        if (message.type === 'noti' && message.event === 'memberLeft') {
            console.log("Info: VA Left..");
            return;
        }
        if (message.type === 'noti' && message.event === 'escalationAccepted') {
            console.log("Info: Human Accepted");
            return;
        }
        appendMessage(message);
    });

    client.on("chat.ended", () => {
        console.log("The chat session has ended.");
        chatWindow.style.display = 'none';
        startChatBtn.style.display = 'block';
    });

    closeChatBtn.addEventListener("click", () => {
        if (client.chat) {
            console.log("Close button clicked. Ending chat...");
            client.finishChat();
        }
    });

    // --- Event Listener for File Selection ---
    attachmentInput.addEventListener('change', function(event) {
        const selectedFile = event.target.files[0];

        if (selectedFile) {
            const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
            if (!allowedTypes.includes(selectedFile.type)) {
                alert('Only JPG, PNG, and MP4 files are allowed.');
                event.target.value = null;
                currentAttachedFile = null;
                chatInput.value = '';
                chatInput.disabled = false;
                return;
            }
            console.log('File selected for sending:', selectedFile.name, 'Type:', selectedFile.type, 'Size:', selectedFile.size, 'bytes');
            currentAttachedFile = selectedFile;
            chatInput.value = `Attached: ${selectedFile.name}`;
            chatInput.disabled = false;
        } else {
            currentAttachedFile = null;
            chatInput.value = '';
            chatInput.disabled = false;
        }
    });

    // --- 7. UI EVENT LISTENERS ---
    startChatBtn.addEventListener("click", startChat);
    sendMessageBtn.addEventListener("click", sendMessage);

    // --- Optional: Send message on Enter key press in the chat input ---
    chatInput.addEventListener("keypress", function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    console.log("Client initialized. Ready to start chat.");
}

// Call the initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeChatApp);
