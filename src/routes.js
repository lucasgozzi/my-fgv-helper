const { Router } = require('express');
const FgvCrawler = require('./services/FgvCrawler');
const routes = Router();

const Student = require('./models/Student');

const mySession = {};

routes.get('/', (req, res) => {
    return res.send('Welcome to my helper');
});

routes.post('/login', async (req, res) => {
    const { user, password } = req.body;
    const loggedIn = await Student.findOne({ login: user });
    let sessionId = '';
    if (loggedIn) {
        sessionId = loggedIn._id;
    } else {
        const student = await Student.create({
            login: user,
            lastUpdatedByFGV: '-',
            lastUpdatedByMe: '-',
            schedule: []
        });
        // no login eu armazeno a senha da fgv em memória para não guardar isso persistente
        sessionId = student._id;
    }

    mySession[sessionId] = { user, password };
    return res.json({ status: true, sessionId });
});

// quando deslogar o usuário tem sua senha removida da memoria
routes.post('/logout', async (req, res) => {
    if (req.headers['token']) {
        mySession[req.headers['token']] = null;
    }
    return res.json({ status: true });
});

routes.post('/teste', (req, res) => {
    return res.json(mySession);
})

// checar se o servidor teve que ser reiniciado e por isso teremos 
// que relogar na ferramenta para prover o password novamente 
routes.post('/is-logged-in', async (req, res) => {
    if (req.headers['token']) {
        if (mySession[req.headers['token']]) {
            return res.json({ status: true });
        } else {
            return res.json({ status: false });
        }
    }
    return res.sendStatus(401);
});

routes.get('/update-calendar', async (req, res) => {
    console.log('start');
    if (req.headers['token']) {
        try {
            const { user, password } = mySession[req.headers['token']];
            const student = await Student.findById(req.headers['token']);
            console.log('get student:', student);
            let crawlerSession = await new FgvCrawler();
            const classes = await crawlerSession.getSchedule(user, password);
            student.lastUpdatedByFGV = classes.lastUpdate;
            const curDate = new Date();
            student.lastUpdatedByMe = `${curDate.getDate()}/${curDate.getMonth() + 1}/${curDate.getFullYear()}`;
            student.schedule = classes.classes;
            student.save()
            return res.json({ status: true });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ status: false });
        }
    } else {
        return res.sendStatus(401);
    }
});

routes.get('/get-classes', async (req, res) => {
    if (req.headers['token']) {
        const student = await Student.findById(req.headers['token']);
        res.json(student);
    } else {
        return res.sendStatus(401);
    }
});


module.exports = routes;