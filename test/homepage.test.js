const assert = require("chai").assert;
const request = require("request");
const baseURL = 'http://localhost:3000/'

describe("signup", () => {
    const url = 'api/user/signup';
    const pseudo = "" + Math.random() + Math.random();
    const password = "password";
    it("first add", (done) => {
        const options = {
            url: baseURL + url,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'my-reddit-client'
            },
            form: {
                pseudo: pseudo,
                password: password
            }
        };

        request(options, (error, response, body) => {
            assert.equal(response.statusCode, 201);
            done()
        })
    })

    it("Add the same", (done) => {
        const options = {
            url: baseURL + url,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'my-reddit-client'
            },
            form: {
                pseudo: pseudo,
                password: password
            }
        };

        request(options, (error, response, body) => {
            assert.equal(response.statusCode, 201);
            done()
        })
    })
})
