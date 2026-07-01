const db = require("../db/queries.js");
const { body, validationResult, matchedData } = require("express-validator");
const passwordUtils = require("../lib/passwordUtils.js");
const pool = require("../db/pool");
const passport = require("passport");

const emptyErr = "must not be empty.";
const lengthErr = "must be between 3 and 50 characters.";

const validateAdmin = [
    body("admin-password")
        .trim()
        .notEmpty()
        .withMessage(`Admin password must not be empty.`)
        .equals("admin")
        .withMessage(`Admin password is incorect.`),
];

const validateMembership = [
    body("membership-password")
        .trim()
        .notEmpty()
        .withMessage(`Membership password must not be empty.`)
        .equals("MembersOnly")
        .withMessage(`Membership password is incorect.`),
];

const validateLogin = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage(`Username ${emptyErr}`)
        .isLength({ min: 3, max: 50 })
        .withMessage(`Username ${lengthErr}`),
    body("password")
        .trim()
        .notEmpty()
        .withMessage(`Password ${emptyErr}`)
        .isLength({ min: 8 })
        .withMessage(`Password should be minimum 8 characters.`),
];

const validateRegister = [
    body("first-name")
        .trim()
        .notEmpty()
        .withMessage(`First Name ${emptyErr}`)
        .isLength({ min: 3, max: 50 })
        .withMessage(`First Name ${lengthErr}`),
    body("last-name")
        .trim()
        .notEmpty()
        .withMessage(`Last Name ${emptyErr}`)
        .isLength({ min: 3, max: 50 })
        .withMessage(`Last Name ${lengthErr}`),
    body("username")
        .trim()
        .notEmpty()
        .withMessage(`Username ${emptyErr}`)
        .isLength({ min: 3, max: 50 })
        .withMessage(`Username ${lengthErr}`)
        .custom(async (value) => {
            const user = await pool.query(
                "SELECT * FROM users WHERE username = $1",
                [value],
            );
            if (user.rows.length > 0) {
                throw new Error();
            }
            return true;
        })
        .withMessage("Username already in use."),
    body("password")
        .trim()
        .notEmpty()
        .withMessage(`Password ${emptyErr}`)
        .isLength({ min: 8 })
        .withMessage(`Password should be minimum 8 characters.`),
    body("confirm-password")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("Confirm Password does not match Password.")
];

async function getMessages(req, res) {
    const messages = await db.getMessages();
    if (!messages) {
        return res.render("index", { title: "Home" });
    }
    return res.render("index", {
        title: "Home",
        user: req.user,
        messages: messages,
    });
}

async function postMessage(req, res) {
    const { "message-sent": messageSent } = req.body;
    if (req.user && req.user.membership_status && messageSent) {
        await db.insertMessage(messageSent, req.user?.id);
    }
    return res.redirect("/");
}

async function deleteMessage(req, res) {
    const { "message-id": messageId } = req.body;
    await db.deleteMessage(messageId);
    return res.redirect("/");
}

function getAdminPasswordForm(req, res, next) {
    res.render("forms/adminPassword", { title: "Admin Password" });
}

const checkAdmin = [
    validateAdmin,
    async function (req, res) {
        const { "admin-password": adminPassword } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("forms/adminPassword", {
                errors: errors.array(),
            });
        }
        await db.approveAdminStatus(req.user.id);
        res.redirect("/");
    },
];

function getMembershipForm(req, res, next) {
    res.render("forms/membership", { title: "Admin Password" });
}

const checkMembershipPassword = [
    validateMembership,
    async function (req, res) {
        const { "membership-password": membershipPassword } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("forms/membership", {
                errors: errors.array(),
            });
        }
        await db.approveMembership(req.user.id);
        res.redirect("/");
    },
];

function getLoginForm(req, res, next) {
    res.render("forms/login", { title: "Login" });
}

const loginUser = [
    validateLogin,
    async (req, res, next) => {
        passport.authenticate("local", function (err, user, info) {
            if (err) {
                console.log(err);
                return next(err);
            }

            if (!user) {
                console.log("no user");
                return res.redirect("/login");
            }

            req.login(user, (err) => {
                if (err) {
                    console.log(err);
                    return next(err);
                }

                return res.redirect("/");
            });
        })(req, res, next);
    },
];

function getRegisterForm(req, res, next) {
    res.render("forms/register", { title: "Register" });
}

const registerUser = [
    validateRegister,
    async (req, res, next) => {
        const {
            "first-name": firstName,
            "last-name": lastName,
            username,
            password,
        } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("forms/register", {
                title: "Register",
                errors: errors.array(),
                firstName,
                lastName,
                username,
            });
        }

        const saltHash = passwordUtils.genPassword(password);

        const salt = saltHash.salt;
        const hash = saltHash.hash;
        const iterationCount = saltHash.iterationCount;

        try {
            await pool.query(
                `INSERT INTO users(first_name, last_name, username, hash, salt, iteration_count, membership_status) VALUES($1, $2, $3, $4, $5, $6, false)`,
                [firstName, lastName, username, hash, salt, iterationCount],
            );

            res.render("forms/login", { title: "Login" });
        } catch (err) {
            next(err);
        }
    },
];

function logoutUser(req, res, next) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        res.redirect("/");
    });
}

module.exports = {
    getAdminPasswordForm,
    checkAdmin,
    getMembershipForm,
    checkMembershipPassword,
    getMessages,
    postMessage,
    deleteMessage,
    getLoginForm,
    loginUser,
    getRegisterForm,
    registerUser,
    logoutUser,
};
