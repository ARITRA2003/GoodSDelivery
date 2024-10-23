import redis from 'redis';

// Create a Redis client
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Redis error: ', err);
});

// Function to update location and status
async function updateDriverLocation(driverId, location, deliveryStatus) {
    await redisClient.hSet(`driver:${driverId}`, {
        location: JSON.stringify(location),
        deliveryStatus,
    });

    // Optionally set an expiration time for the location data
    await redisClient.expire(`driver:${driverId}`, 3600); // Expires in 1 hour
}
