#! /usr/bin/env node

const { Client } = require("pg");
require('dotenv').config();

const SQL = `
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS users_messages_connection CASCADE;
DROP TABLE IF EXISTS session CASCADE;
`;


async function main() {
    console.log("deleting...");
    const client = new Client({
        connectionString: process.env.DB_CONNECTION_STRING
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
}

main();