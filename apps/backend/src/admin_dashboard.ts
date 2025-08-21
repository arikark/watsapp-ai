export function renderAdminDashboard() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp AI Chatbot - Admin Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .content {
            padding: 30px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }

        input, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        input:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }

        button:hover {
            transform: translateY(-2px);
        }

        .response {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            background: #f8f9fa;
            border-left: 4px solid #667eea;
        }

        .error {
            background: #fee;
            border-left-color: #e74c3c;
        }

        .success {
            background: #efe;
            border-left-color: #27ae60;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }

        .stat-label {
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 WhatsApp AI Chatbot</h1>
            <p>Admin Dashboard - Test and Monitor Your AI Assistant</p>
        </div>

        <div class="content">
            <div class="section">
                <h2>📤 Send Test Message</h2>
                <form id="sendForm">
                    <div class="form-group">
                        <label for="phoneNumber">Phone Number (with country code):</label>
                        <input type="text" id="phoneNumber" placeholder="+1234567890" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Message:</label>
                        <textarea id="message" rows="4" placeholder="Type your test message here..." required></textarea>
                    </div>
                    <button type="submit">Send Message</button>
                </form>
                <div id="sendResponse"></div>
            </div>

            <div class="section">
                <h2>📊 Conversation Statistics</h2>
                <div class="form-group">
                    <label for="statsPhoneNumber">Phone Number:</label>
                    <input type="text" id="statsPhoneNumber" placeholder="+1234567890">
                    <button onclick="getStats()" style="margin-top: 10px;">Get Statistics</button>
                </div>
                <div id="statsResponse"></div>
            </div>

            <div class="section">
                <h2>💬 Conversation History</h2>
                <div class="form-group">
                    <label for="historyPhoneNumber">Phone Number:</label>
                    <input type="text" id="historyPhoneNumber" placeholder="+1234567890">
                    <button onclick="getHistory()" style="margin-top: 10px;">Get History</button>
                </div>
                <div id="historyResponse"></div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('sendForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const phoneNumber = document.getElementById('phoneNumber').value;
            const message = document.getElementById('message').value;
            const responseDiv = document.getElementById('sendResponse');

            try {
                const response = await fetch('/api/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phoneNumber, message })
                });

                const result = await response.json();

                if (response.ok) {
                    responseDiv.innerHTML = \`
                        <div class="response success">
                            <strong>✅ Message sent successfully!</strong><br>
                            Message ID: \${result.messageId}
                        </div>
                    \`;
                } else {
                    responseDiv.innerHTML = \`
                        <div class="response error">
                            <strong>❌ Error:</strong> \${result.error}
                        </div>
                    \`;
                }
            } catch (error) {
                responseDiv.innerHTML = \`
                    <div class="response error">
                        <strong>❌ Network Error:</strong> \${error.message}
                    </div>
                \`;
            }
        });

        async function getStats() {
            const phoneNumber = document.getElementById('statsPhoneNumber').value;
            const responseDiv = document.getElementById('statsResponse');

            if (!phoneNumber) {
                responseDiv.innerHTML = \`
                    <div class="response error">
                        <strong>❌ Please enter a phone number</strong>
                    </div>
                \`;
                return;
            }

            try {
                const response = await fetch(\`/api/stats/\${phoneNumber}\`);
                const result = await response.json();

                if (response.ok) {
                    responseDiv.innerHTML = \`
                        <div class="response success">
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-number">\${result.messageCount}</div>
                                    <div class="stat-label">Total Messages</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">\${result.phoneNumber}</div>
                                    <div class="stat-label">Phone Number</div>
                                </div>
                            </div>
                        </div>
                    \`;
                } else {
                    responseDiv.innerHTML = \`
                        <div class="response error">
                            <strong>❌ Error:</strong> \${result.error}
                        </div>
                    \`;
                }
            } catch (error) {
                responseDiv.innerHTML = \`
                    <div class="response error">
                        <strong>❌ Network Error:</strong> \${error.message}
                    </div>
                \`;
            }
        }

        async function getHistory() {
            const phoneNumber = document.getElementById('historyPhoneNumber').value;
            const responseDiv = document.getElementById('historyResponse');

            if (!phoneNumber) {
                responseDiv.innerHTML = \`
                    <div class="response error">
                        <strong>❌ Please enter a phone number</strong>
                    </div>
                \`;
                return;
            }

            try {
                const response = await fetch(\`/api/conversation/\${phoneNumber}?limit=10\`);
                const result = await response.json();

                if (response.ok) {
                    const messagesHtml = result.messages.map(msg => \`
                        <div style="margin-bottom: 10px; padding: 10px; background: \${msg.is_from_user ? '#e3f2fd' : '#f3e5f5'}; border-radius: 5px;">
                            <strong>\${msg.is_from_user ? '👤 User' : '🤖 AI'}:</strong> \${msg.message}<br>
                            <small style="color: #666;">\${new Date(msg.timestamp).toLocaleString()}</small>
                        </div>
                    \`).join('');

                    responseDiv.innerHTML = \`
                        <div class="response success">
                            <h3>Recent Messages:</h3>
                            \${messagesHtml || '<p>No messages found.</p>'}
                        </div>
                    \`;
                } else {
                    responseDiv.innerHTML = \`
                        <div class="response error">
                            <strong>❌ Error:</strong> \${result.error}
                        </div>
                    \`;
                }
            } catch (error) {
                responseDiv.innerHTML = \`
                    <div class="response error">
                        <strong>❌ Network Error:</strong> \${error.message}
                    </div>
                \`;
            }
        }
    </script>
</body>
</html>
  `;
}
