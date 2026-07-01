const crypto = require("crypto");

// TODO

function genPassword(password) {
    const salt = crypto.randomBytes(32).toString("hex");
    const iterationCount = 60000;
    const genHash = crypto
        .pbkdf2Sync(password, salt, iterationCount, 64, "sha512")
        .toString("hex");

    return {
        salt: salt,
        hash: genHash,
        iterationCount: iterationCount
    };
}

function validPassword(password, hash, salt, iterationCount) {
    var hashVerify = crypto
                    .pbkdf2Sync(password, salt, iterationCount, 64, 'sha512')
                    .toString('hex')
    return hash === hashVerify;
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
