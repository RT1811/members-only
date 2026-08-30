require("dotenv").config();
const pool = require("./pool");

async function getAllMessages() {
    const result = await pool.query(
        `SELECT messages.*, users.first_name, users.last_name
        FROM messages
        LEFT JOIN users ON messages.user_id = users.id
        ORDER BY messages.created_at DESC`
    );
    return result.rows;
}

async function createMessage(title, text, userId) {
    await pool.query(
        "INSERT INTO messages (title, text, user_id) VALUES ($1, $2, $3)",
        [title, text, userId]
    );
}

async function deleteMessage(id) {
    await pool.query("DELETE FROM messages WHERE id = $1", [id]);
}

module.exports = {
  getAllMessages,
  createMessage,
  deleteMessage,
};