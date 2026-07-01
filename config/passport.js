const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../db/pool");
const { validPassword } = require("../lib/passwordUtils");

const customFields = {
    usernameField: "username",
    passwordField: "password",
};

const verifyCallback = async (username, password, done) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username],
        );
        const user = rows[0];

        if (!user) {
            return done(null, false, { message: "Incorrect username" });
        }

        const isValid = validPassword(password, user.hash, user.salt, user.iteration_count);

        if (isValid) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err);
    }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (userId, done) => {
    try {
        const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId])
        done(null, user.rows[0]);
    } catch (err) {
        done(err);
    }

})