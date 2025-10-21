const readline = require('readline');
const bcrypt = require('bcryptjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupAdmin() {
  console.log('🔧 Admin Setup Script');
  console.log('This will create an admin account for your application.\n');

  const username = await new Promise((resolve) => {
    rl.question('Enter admin username: ', resolve);
  });

  const password = await new Promise((resolve) => {
    rl.question('Enter admin password (min 8 characters): ', resolve);
  });

  if (password.length < 8) {
    console.log('❌ Password must be at least 8 characters long');
    rl.close();
    return;
  }

  try {
    const API_URL = process.env.API_URL || 'http://localhost:5001';
    
    const response = await fetch(`${API_URL}/api/admin/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Admin account created successfully!');
      console.log(`Username: ${username}`);
      console.log('You can now login to the admin panel.');
    } else {
      console.log('❌ Failed to create admin account:', result.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n💡 Make sure your server is running on the correct port.');
    console.log('You can also create an admin account by making a POST request to:');
    console.log(`${process.env.API_URL || 'http://localhost:5001'}/api/admin/setup`);
    console.log('With body: { "username": "your_username", "password": "your_password" }');
  }

  rl.close();
}

setupAdmin();