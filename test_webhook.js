// Test script to verify webhook configuration
const https = require('https');

// Test webhook verification
function testWebhookVerification() {
  const options = {
    hostname: 'watsapp-ai.arielkark.workers.dev',
    port: 443,
    path: '/webhook?hub.mode=subscribe&hub.verify_token=test&hub.challenge=test123',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Response: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
  });

  req.end();
}

// Test webhook POST (simulate WhatsApp message)
function testWebhookPost() {
  const postData = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{
      id: '123456789',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '+15551825985',
            phone_number_id: 'your_phone_number_id'
          },
          contacts: [{
            profile: {
              name: 'Test User'
            },
            wa_id: '15551825985'
          }],
          messages: [{
            from: '15551825985',
            id: 'wamid.test123',
            timestamp: '1234567890',
            text: {
              body: 'Hello, AI!'
            },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  });

  const options = {
    hostname: 'watsapp-ai.arielkark.workers.dev',
    port: 443,
    path: '/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`POST Status: ${res.statusCode}`);
    console.log(`POST Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`POST Response: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`POST Error: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('Testing webhook verification...');
testWebhookVerification();

console.log('\nTesting webhook POST...');
testWebhookPost();
