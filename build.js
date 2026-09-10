const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
if (!fs.existsSync(file)) throw new Error('index.html not found');
console.log('Build completed successfully');
