const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.get('/login', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Login</title>
            </head>
            <body>
                <form method="POST" action="/auth">
                    Nombre:
                    <input type="text" name="username"></input><br>
                    Contraseña:
                    <input type="password" name="password"></input><br>
                    <input type="submit" value="Iniciar sesión"></input>
                </form>
            </body>
        </html>
    `);
});

app.post('/auth', (req, res) => {
    const {username, password} = req.body;
    // consultar a BD y validar que existan los campos
    const user = {username: username}

    const accessToken = generateAccessToken(user);

    res.header('authorization', accessToken).json({
        message: 'Usuario autenticado',
        token: accessToken
    })

});

function generateAccessToken(user){
    return jwt.sign(user, process.env.SECRET, {expiresIn: '5m'});
}

// MIDDLEWARE
function validateToken(req, res, next){
    const accessToken = req.headers['authorization'] || req.query.accessToken;
    if(!accessToken) res.send('Access denied');

    jwt.verify(accessToken, process.env.SECRET, (err, user) => {
        if(err){
            res.send('Access denied, token expired or incorrect');
        }else{
            req.user=user;
            next();
        }
    })
}

app.get('/api', validateToken, (req, res) => {
    res.json({
        username: req.user,
        tuits: [
            {
                id: 0,
                text: 'Este es el primer tweet'
            },
            {
                id: 0,
                text: 'El mejor idioma es Deutsch'
            }
        ]
    })
});

app.listen(3000, ()=> {
    console.log('servidor iniciado...');
})