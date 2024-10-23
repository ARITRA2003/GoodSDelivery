import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Function to create tables automatically if they don't exist
async function createTables() {
    const createCustomersTableQuery = `
    CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        contactNumber VARCHAR(15) NOT NULL
    )`;

    const createDriversTableQuery = `
    CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        contactNumber VARCHAR(15) NOT NULL,
        available TINYINT(1) NOT NULL DEFAULT 1 ,
        trips INT NOT NULL DEFAULT 0
    )`;


    const createAdminTableQuery = `
    CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        contactNumber VARCHAR(15) NOT NULL
    )`;

    const createBookingTableQuery = `
        CREATE TABLE IF NOT EXISTS CurrentBookings (
            bookingid INT AUTO_INCREMENT PRIMARY KEY,
            driverid INT NOT NULL,
            customerid INT NOT NULL UNIQUE,
            distance INT DEFAULT 0,
            cost INT DEFAULT 0,
            weight FLOAT NOT NULL default 0,
            source VARCHAR(255) NOT NULL,
            destination VARCHAR(255) NOT NULL,
            status VARCHAR(15) default "on route"
        )`;

    try {
        await pool.query(createCustomersTableQuery);
        await pool.query(createDriversTableQuery);
        await pool.query(createAdminTableQuery);
        await pool.query(createBookingTableQuery);
        console.log("Tables created or already exist.");
    } catch (error) {
        console.error("Error creating tables:", error);
    }
}

// Call the function when your application starts
createTables();

export default pool;
