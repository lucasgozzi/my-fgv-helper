const { Router } = require('express');
const routes = Router();

routes.get('/', (req, res) => {
    return res.send('Welcome to my helper');
});

routes.get('/get-calendar', (req, res) => {
    return res.send('Welcome to my helper');
});

module.exports = routes;