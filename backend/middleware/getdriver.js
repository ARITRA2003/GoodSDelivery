import pool from "../SqlDB.js";

const getAvailableDriver = async (req, res, next) => {
    try {
        const [driverResults] = await pool.query(`
            SELECT id 
            FROM drivers 
            WHERE available = 1
            LIMIT 1
        `);

        if (driverResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No available drivers found.'
            });
        }

        req.driverid  = driverResults[0].id;
        next();
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message
        });
    }
};

export default getAvailableDriver;
