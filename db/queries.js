const pool = require("./pool.js");

async function getMessages() {
    const { rows } = await pool.query(
        `SELECT m.id AS id, m.content AS message, m.created_at AS created_at, u.username AS username FROM messages m
         JOIN users_messages_connection umc ON m.id = umc.message_id 
         JOIN users u ON u.id = umc.user_id ORDER BY created_at;`,
    );
    return rows;
}

async function approveAdminStatus(userId) {
    await pool.query(
        `UPDATE users SET admin = true WHERE id = $1;`,
        [userId],
    );
}

async function approveMembership(userId) {
    await pool.query(
        `UPDATE users SET membership_status = true WHERE id = $1;`,
        [userId],
    );
}

async function insertMessage(message, userId) {
    const { rows:newMessageId} = await pool.query(
        `INSERT INTO messages(content) VALUES ($1) RETURNING id;`,
        [message],
    );
    await pool.query(
        `INSERT INTO users_messages_connection(user_id, message_id) VALUES($1, $2);`,
        [userId, newMessageId[0].id],
    );
}

async function deleteMessage(messageId) {
    await pool.query(
        `UPDATE messages SET content = 'MESSAGE DELETED' WHERE id = $1;`,
        [messageId],
    );
}

module.exports = {
    getMessages,
    insertMessage,
    deleteMessage,
    approveAdminStatus,
    approveMembership
};
