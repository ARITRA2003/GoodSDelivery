import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET; 

const authenticateCustomer = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET); 
        req.id = decoded.user.id;  
        next(); 
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid token." });
    }
};

export default authenticateCustomer;
