const { Router } = require('express');
const FgvCrawler = require('./services/FgvCrawler');
const routes = Router();

const Student = require('./models/Student');

const mySession = {};

routes.get('/', (req, res) => {
    return res.send(`<h2>Privacy Policy</h2>
    <p>Your privacy is important to us. It is SmsrtThinking IT's policy to respect your privacy regarding any information we may collect from you across our website, <a href="https://fgv-helper.herokuapp.com">https://fgv-helper.herokuapp.com</a>, and other sites we own and operate.</p>
    <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
    <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
    <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
    <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
    <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.</p>
    <p>Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.</p>
    <p>This policy is effective as of 10 February 2020.</p>
    <p>Generated by <a title="Privacy Policy Template Generator" href="https://getterms.io/">GetTerms.io</a></p>
    `);
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