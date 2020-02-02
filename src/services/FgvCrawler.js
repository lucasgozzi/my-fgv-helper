const puppeteer = require('puppeteer');

let browser = null;
let page = null;

module.exports = class FgvCrawler {

    constructor() {
        this.browser = null;
        this.page = null;
        return this;
    }

    async start() {
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
        await this.page.goto('http://smartcps.ibe.edu.br/smart/');
        return this;
    }
    async findLoginInput() {
        // melhorar...
        await this.page.keyboard.press('Tab', {
            delay: 100
        });
        await this.page.keyboard.press('Tab', {
            delay: 100
        });
        await this.page.keyboard.press('Tab', {
            delay: 100
        });
        await this.page.keyboard.press('Tab', {
            delay: 100
        });
        await this.page.keyboard.press('Tab', {
            delay: 100
        });
    }

    async getSchedule(user, password) {
        await this.start();

        await this.findLoginInput();
        await this.page.keyboard.type(user);

        await this.page.keyboard.press('Tab', {
            delay: 100
        });
        await this.page.keyboard.type(password);

        await this.page.keyboard.press('Enter', {
            delay: 100
        });

        await this.page.keyboard.press('Enter', {
            delay: 100
        });
        await this.page.keyboard.press('Enter', {
            delay: 2000
        });
        await this.page.goto('http://smartcps.ibe.edu.br/smart/Aluno/cronograma/cronograma.asp?IdMenu=62')

        const arr = await this.page.evaluate(_ => {
            const responseObj = { lastUpdate: '', classes: [] };
            const trs = document.querySelectorAll("table")[1].tBodies[0].children;
            for (var i = 2; i < trs.length; i++) {
                const tr = trs[i];
                const obj = {};
                if (tr.children[0].innerHTML.startsWith('Última')) {
                    responseObj.lastUpdate = tr.children[0].innerHTML.split(':')[1];
                    continue;
                }

                try {
                    obj.date = tr.children[0].innerHTML;
                    obj.dayOfWeek = tr.children[1].innerHTML;
                    obj.class = tr.children[2].innerHTML;
                    obj.type = tr.children[3].innerHTML;
                    responseObj.classes.push(obj);
                } catch (e) {
                }
            }

            return responseObj;
        });

        await this.destroy();

        return arr;
    }

    async destroy() {
        this.browser.close();
    }

}