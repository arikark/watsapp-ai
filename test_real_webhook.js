// Test script to verify webhook with correct token format
const https = require('https');

// Instructions for testing
console.log('🔧 WEBHOOK VERIFICATION TEST');
console.log('============================');
console.log('');
console.log('To test your webhook verification:');
console.log('');
console.log('1. Go to Meta Dashboard: https://developers.facebook.com/');
console.log('2. Navigate to WhatsApp > Configuration > Webhook');
console.log('3. Check your "Verify token" value');
console.log('4. Run this command with your actual verify token:');
console.log('');
console.log('   curl -i "https://watsapp-ai.arielkark.workers.dev/webhook?hub.mode=subscribe&hub.verify_token=YOUR_ACTUAL_TOKEN&hub.challenge=test123"');
console.log('');
console.log('Expected response: "test123"');
console.log('If you get "Forbidden", the verify token is wrong.');
console.log('');

// Test with a sample token format
function testWithSampleToken() {
  console.log('🧪 Testing with sample token format...');

  const options = {
    hostname: 'watsapp-ai.arielkark.workers.dev',
    port: 443,
    path: '/webhook?hub.mode=subscribe&hub.verify_token=sample_token_123&hub.challenge=test123',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Response: "${data}"`);
      console.log('');
      if (res.statusCode === 403) {
        console.log('❌ This is expected - sample token is wrong');
        console.log('✅ Your webhook endpoint is working correctly');
        console.log('🔧 You need to use your actual verify token from Meta dashboard');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
  });

  req.end();
}

testWithSampleToken();

console.log('📱 NEXT STEPS:');
console.log('1. Check your Meta dashboard webhook configuration');
console.log('2. Make sure the verify token matches your WHATSAPP_VERIFY_TOKEN secret');
console.log('3. Ensure "messages" event is subscribed');
console.log('4. Try sending a message to 15551825985 again');
console.log('');
console.log('🔍 If webhook still doesn\'t trigger, check:');
console.log('- Phone number is properly configured');
console.log('- Webhook is verified (green checkmark)');
console.log('- Events are subscribed');
console.log('- No typos in callback URL or verify token');
