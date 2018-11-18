module.exports = {
    app: {
        port: 8080,
        db: "mongodb://127.0.0.1:27017/redirects",
        collection: "links",
        root: "http://localhost/"
    },
    auth: {
        username: "admin",
        password: "password"
    }
}