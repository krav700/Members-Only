#! /usr/bin/env node

const { Client } = require("pg");
require("dotenv").config();

const SQL = `

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR ( 50 ),
    last_name VARCHAR ( 50 ),
    username VARCHAR ( 50 ),
    hash VARCHAR ( 255 ),
    salt VARCHAR ( 255 ),
    iteration_count INTEGER,
    membership_status BOOLEAN DEFAULT false,
    admin BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users_messages_connection (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, message_id)
);

INSERT INTO users (first_name, last_name, username, hash, salt)
VALUES
('John', 'Doe', 'johndoe', 'hashed_password_1', 'salt123'),
('Jane', 'Smith', 'janesmith', 'hashed_password_2', 'salt456'),
('Alice', 'Johnson', 'alicej', 'hashed_password_3', 'salt789'),
('Bob', 'Brown', 'bobbrown', 'hashed_password_4', 'salt321');

INSERT INTO messages (content)
VALUES
('Hello everyone!'),
('How are you doing?'),
('Welcome to the chat!'),
('See you later!');

INSERT INTO users_messages_connection (user_id, message_id)
VALUES
(1, 1),
(2, 2),
(3, 3),
(1, 4),
(4, 2);


`;

async function main() {
    console.log("seeding...");
    const client = new Client({
        connectionString: process.env.DB_CONNECTION_STRING
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
}

main();
