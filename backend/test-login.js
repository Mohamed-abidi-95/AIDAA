const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(body)
          });
        } catch {
          resolve({
            status: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testLogin() {
  console.log('\n=== Testing Admin Login ===\n');
  
  try {
    // Wait for server to start
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('1. Testing health check...');
    const health = await makeRequest('GET', '/health');
    console.log('   Status:', health.status);
    console.log('   Response:', health.body);
    
    console.log('\n2. Testing admin login with credentials:');
    console.log('   Email: admin@aidaa.com');
    console.log('   Password: admin123');
    
    const login = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@aidaa.com',
      password: 'admin123'
    });
    
    console.log('   Status:', login.status);
    console.log('   Response:', JSON.stringify(login.body, null, 2));
    
    if (login.body.success && login.body.data && login.body.data.token) {
      console.log('\n✓ LOGIN SUCCESSFUL!');
      console.log('   Token:', login.body.data.token.substring(0, 50) + '...');
      console.log('   User:', login.body.data.user);
    } else {
      console.log('\n✗ LOGIN FAILED');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();

