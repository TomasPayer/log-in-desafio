const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)


const app = express()

app.use(session({
    store: new FileStore( { path: './sessions', ttl: 300, retries: 0}),
    secret: 'tomas123',
    resave: false,
    saveUninitialized: false
}))


app.get('/counter', (req, res) => {
    if(req.session.contador) {
        req.session.contador++;
        res.send(`You have entered the site ${req.session.contador} times.`)
    } else {
        req.session.contador = 1;
        res.send('Welcome')
    }
})

app.get('/login', (req, res) => {
    const { username, password } = req.query;
    

    
    if(username == 'admin' && password == 'admin123') {
        req.session.user = username;
        req.session.admin = true;
        req.session.logged = true;
    } else if(username == 'tpayer' && password == 'tomas123') {
        req.session.user = username;
        req.session.logged = true;
    } else {
        return res.send('Wrong username or password')
    }


    return res.send('Login success')
})

function checkAuth(req, res, next) {
    if(req.session?.admin) {
        return next();
    }

    return res.status(401).send('You do not have permissions')
}

//localhost:8080/login?username=tpayer&password=tomas123

function checkLogged(req, res, next) {
    if(req.session?.logged) {
        return next();
    }

    return res.status(401).send('You do not have permissions')
}

app.get('/privateAdmin', checkAuth, (req, res) => {
    res.send('page for admin')
})


app.get('/privateClient', checkLogged, (req, res) => {
    res.send('page for user')
})


app.get('/logout', (req, res) => {
    req.session.destroy( error => {
        if (error) {
            res.send({status: 'Logout Error', body: error})
        }
    })

    res.send('Logged out')
})



const server = app.listen(8080, () => {
    console.log('Server on port 8080');
})


server.on('error', error => console.log(`Server Error ${error}`))