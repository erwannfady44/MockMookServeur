const request = require('supertest')
const app = require('../app')

describe("api-docs", () => {
    it("test api docs", () => {
        request(app).get("/api-docs")
            .expect(200)
    })
})

describe("sign-up", () => {
    const url = "api/user/signup/";
    const pseudo = ""+Math.random()+Math.random()+Math.random()
    const password = "password"
    it("new user", () => {
        request(app).post(url)
            .send({
                pseudo: pseudo,
                password: password
            })
            .expect(201)
    })

    it ("add same user", () => {
        request(app).post(url)
            .send({
                pseudo: pseudo,
                password: password
            })
            .expect(403)
    })
})
