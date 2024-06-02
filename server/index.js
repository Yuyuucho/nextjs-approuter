const express = require("express");
const mysql = require('mysql');
const http = require('http');
const {error} = require('console');
const {resourceLimits} = require('worker_threads');


const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');
const {socket} = require('dgram');
const io = new Server(server, {
    cors: {
        origin:['http:localhost:3000'],
    },
});

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

io.on('connection', (socket) => {
    console.log('クライアントと接続しました');
    socket.on('disconnect', () => {
        console.log('クライアントと接続が切れました');
    });
});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'banana77',
    database: 'list_app'
})

//ここから中身--------------------------------------------------------------------------------------
app.post('signup',
    (req, res, next) => {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const errors = [];
        
        if(username === ''){
            errors.push('ニックネームを入力してください');
        }
        if(email === ''){
            errors.push('メールアドレスを入力してください');
        }
        if(password === ''){
            errors.push('パスワードを入力してください');
        }
        if(errors.length > 0){
            res.redirect('/signup', {errors: errors});
        }else{
            next();
        }
    },
    (req, res, next) => {
        const email = req.body.email;
        const errors = [];
        connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            (error, results) => {
                if(results.length > 0){
                    errors.push('メールアドレスはすでに使われています');
                    res.render('signup.js', {errors: errors});
                }else{
                    next();
                }
            }
        );
    },
    (req, res) => {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        
        connection.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password],
            (error, results) => {
                redirect('/');    
            }
        );
    }
);


const PORT = 5000;
server.listen(PORT, () => console.log(`server is runnng on ${PORT}`));