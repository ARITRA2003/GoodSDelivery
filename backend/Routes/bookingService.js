import pool from "../SqlDB.js";
import express from "express";
import getAvailableDriver from "../middleware/getdriver.js";
import authenticateCustomer from "../middleware/authenticateUser.js"
import redis from 'redis';

// Create a Redis client
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Redis error: ', err);
});

async function updateDriverLocation(driverId, location, deliveryStatus) {
    // Store location and delivery status in Redis
    await redisClient.hSet(`driver:${driverId}`, {
        location: JSON.stringify(location),
        deliveryStatus,
    });

    // Optionally set an expiration time for the location data (e.g., 1 hour)
    await redisClient.expire(`driver:${driverId}`, 3600); // Expires in 1 hour
}



const router = express.Router();

// Add booking
router.post('/addBooking',authenticateCustomer, getAvailableDriver, async (req, res) => {
    const { price,weight, distance, source, destination } = req.body;
    const driverid = req.driverid;
    const customerid = req.id;
    try {
        // Insert the new booking
        const [insertResult] = await pool.query(`
            INSERT INTO CurrentBookings (driverid, customerid, weight, distance, source, destination, cost)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [driverid, customerid, weight, distance, source, destination, price]);
        
        await pool.query(`
            UPDATE drivers 
            SET available = 0 
            WHERE id = ?
        `, [driverid]);
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully.'
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
});

//view All Booking for customer 
router.post('/viewBooking',authenticateCustomer,  async (req, res) => {
    const id = req.id;
    try {
        // Select bookings where the status is not 'completed'
        const [rows] = await pool.query(`
            SELECT * 
            FROM CurrentBookings 
            WHERE customerid = ? AND status != 'completed'
        `, [id]);

        // If no bookings found
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active bookings found.'
            });
        }

        // Return active bookings
        res.status(200).json({
            success: true,
            bookings: rows
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
});


// Driver can only do 
router.post('/updateBookingLocation', authenticateCustomer, async (req, res) => {
    const { location, deliveryStatus } = req.body;
    const driverId = req.id;

    // Call the function to update the driver's location in Redis
    await updateDriverLocation(driverId, location, deliveryStatus);

    // Emit the location update to the specific customer and all admins
    const customerSocketId = customerSockets[customerId]; // Get the customer's socket ID
    io.to(customerSocketId).emit('locationUpdate', { driverId, location, deliveryStatus });
    
    // Emit to all admins (assuming you have a way to identify admin sockets)
    io.emit('adminLocationUpdate', { driverId, location, deliveryStatus });

    res.json({
        success: true,
        message: 'Location updated successfully.' 
    });
});

export default router;
