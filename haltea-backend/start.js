#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting HALTÉA Backend Server...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env file found!');
    console.log('📝 Please create a .env file with the following variables:');
    console.log('');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
    console.log('RECIPIENT_EMAIL=contact@yourdomain.com');
    console.log('PORT=3001');
    console.log('');
    console.log('💡 You can copy env.example to .env and fill in your details');
    console.log('');
}

// Start the server
const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

server.on('close', (code) => {
    console.log(`\n📴 Server stopped with code ${code}`);
});

server.on('error', (error) => {
    console.error('❌ Error starting server:', error);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGTERM');
    process.exit(0);
});
