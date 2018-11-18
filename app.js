var express = require("express"),
    config = require("./config"),
    bodyParser = require("body-parser"),
    app = express(),
    session = require("express-session"),
    cookieParser = require("cookie-parser"),
    expressMongoDB = require("express-mongo-db"),
    swig = require("swig");

app.engine("html", swig.renderFile);
app.set("view engine", "html");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/static"));
app.use(expressMongoDB(config.app.db));
app.use(cookieParser());
app.use(session({secret: "anything", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view cache", false);
swig.setDefaults({cache: false});

app.locals = {
    root: config.app.root
};

app.get("*", function(req, res, next) {
    next();
});

app.get("/", function(req, res) {
    if (req.session.auth) {
        req.db.collection(config.app.collection).find({}, {
            sort: {
                key: 1
            }
        }, function(err, result) {
            if (!err) {
                result.toArray().then(function(result) {
                    res.render("manage", { title: "Manage", redirects: result });
                });
            }
            else {
                res.status(500).render("error", { title: "Internal Error", code: 500, message: "The connection to the server database failed." });
            }
        });
    }
    else {
        res.render("login", { title: "Login" });
    }
});

app.get("/logout/", function(req, res, next) {
    req.session.destroy();
    res.redirect("/");
});

app.get("/:key", function(req, res, next) {
    req.db.collection(config.app.collection).findOne({ 
        key: req.params.key 
    }, function(err, result) {
        if (!err) {
            if (result) {
                if (result.enabled === true) {
                    res.redirect(result.redirect);
                }
                else {
                    res.status(423).render("error", { title: "Unavailable", code: 423, message: "The URL you requested is unavailable." });
                }
            }
            else {
                res.status(404).render("error", { title: "Not Found", code: 404, message: "The URL you requested was not found." });
            }
        }
        else {
            res.status(500).render("error", { title: "Internal Error", code: 500, message: "The connection to the server database failed." });
        }
    });
});

app.post("/login/", function(req, res, next) {
    if (req.body.username == config.auth.username && req.body.password === config.auth.password) {
        req.session.auth = true;
        res.sendStatus(204);
    }
    else {
        res.sendStatus(403);
    }
});

app.post("/add/", function(req, res, next) {
    var r = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);

    if (r.test(req.body.redirect) === true) {
        req.db.collection(config.app.collection).findOne({
            key: req.body.key
        }, function(err, result) {
            if (!result) {
                req.db.collection(config.app.collection).insertOne({
                    key: req.body.key,
                    redirect: req.body.redirect,
                    enabled: true
                }, function(err, result) {
                    if (!err) {
                        res.sendStatus(201);
                    }
                    else {
                        res.sendStatus(500);
                    }
                });
            }
            else {
                res.sendStatus(400);
            }
        });
    }
    else {
        res.sendStatus(400);
    }
});

app.post("/get/", function(req, res, next) {
    req.db.collection(config.app.collection).findOne({
        key: req.body.key
    }, function(err, result) {
        if (!err) {
            res.send(result);
        }
        else {
            res.sendStatus(500);
        }
    });
});

app.post("/edit/", function(req, res, next) {
    var r = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);

    if (r.test(req.body.redirect) === true) {
        req.db.collection(config.app.collection).updateOne({
            key: req.body.key
        }, {
            key: req.body.key,
            redirect: req.body.redirect,
            enabled: true
        }, function(err, result) {
            if (!err) {
                res.sendStatus(204);
            }
            else {
                res.sendStatus(500);
            }
        });
    }
    else {
        res.sendStatus(400);
    }
});

app.post("/toggle/", function(req, res, next) {
    req.db.collection(config.app.collection).findOne({
        key: req.body.key
    }, function(err, result) {
        if (!err) {
            var status = (result.enabled === false);
            req.db.collection(config.app.collection).updateOne({
                key: req.body.key
            }, {
                "$set": {
                    enabled: status
                }
            }, function(err, result) {
                if (!err) {
                    res.sendStatus(204);
                }
                else {
                    res.sendStatus(500);
                }
            });
        }
        else {
            res.sendStatus(500);
        }
    }); 
});

app.post("/delete/", function(req, res, next) {
    req.db.collection(config.app.collection).deleteOne({
        key: req.body.key
    }, function(err, result) {
        if (!err) {
            res.sendStatus(204);
        }
        else {
            res.sendStatus(500);
        }
    }); 
});

var server = app.listen(config.app.port, function() {
    console.log("Listening on Port " + config.app.port);
});