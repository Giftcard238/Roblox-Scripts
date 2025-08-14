const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Owner credentials
const OWNER_USERNAME = "Owner";
const OWNER_PASSWORD = "mtndewiscool";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let loggedIn = false;
const scriptsPath = path.join(__dirname, 'scripts.json');

// Auto-create scripts.json if missing
if (!fs.existsSync(scriptsPath)) fs.writeFileSync(scriptsPath, JSON.stringify([]), 'utf8');

// Login page
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === OWNER_USERNAME && password === OWNER_PASSWORD) {
        loggedIn = true;
        res.redirect('/dashboard');
    } else {
        res.send('Invalid credentials.');
    }
});

// Owner dashboard
app.get('/dashboard', (req, res) => {
    if(!loggedIn) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Post a new script
app.post('/post-script', (req, res) => {
    if(!loggedIn) return res.redirect('/');
    const { name, content } = req.body;
    const newScript = { name, content, tag: "#script", date: new Date() };

    let scripts = JSON.parse(fs.readFileSync(scriptsPath, 'utf8'));
    scripts.push(newScript);
    fs.writeFileSync(scriptsPath, JSON.stringify(scripts, null, 2), 'utf8');

    res.redirect('/dashboard');
});

// Public page to see all scripts
app.get('/all-scripts', (req, res) => {
    let scripts = JSON.parse(fs.readFileSync(scriptsPath, 'utf8'));
    let html = `<h1>All Scripts</h1>`;
    scripts.forEach(s => {
        html += `<h3>${s.name}</h3>
                 <p>Tag: ${s.tag}</p>
                 <pre>${s.content}</pre>
                 <hr>`;
    });
    res.send(html);
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
