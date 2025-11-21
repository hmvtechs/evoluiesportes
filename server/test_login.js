const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
    identifier: 'user1@example.com',
    password: 'senha123'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let body = '';

    res.on('data', d => {
        body += d;
    });

    res.on('end', () => {
        fs.writeFileSync('login_error.txt', body);
        console.log('Response written to login_error.txt');
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
