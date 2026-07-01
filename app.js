const path = require("node:path");
const express = require("express");
const app = express();
const indexRouter = require("./routes/indexRouter.js");
var passport = require("passport");
const pool = require("./db/pool.js");
const session = require("express-session");
require("./config/passport");

const assetsPath = path.join(__dirname, "public");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(assetsPath));

app.use(
    session({
        store: new (require("connect-pg-simple")(session))({
            pool: pool,
            tableName: "session",
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);

const PORT = 3000;
app.listen(process.env.PORT ?? PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Inventory Application - listening on port ${PORT}!`);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).render("errorPages/errorPage", {
        errorMessage: err.message,
    });
});

app.use((req, res) => {
    res.status(404).render("errorPages/404", {
        title: "404",
        pageURL: req.path,
    });
});
