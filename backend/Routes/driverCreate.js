import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../SqlDB.js";

dotenv.config();

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// Create a driver
router.post("/createdriver",
    [
        body('email', "Invalid Credentials").isEmail(),
        body('password', "Invalid Credentials").isLength({ min: 8 }),
        body('name', "Invalid Credentials").isLength({ min: 4 }),
        body('contactNumber', "Invalid contact number").isLength({ min: 10, max: 15 })
    ],
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ errors: result.array() });
        }

        const { email, name, password, contactNumber } = req.body;
        try {
            const [rows] = await pool.query("SELECT * FROM drivers WHERE email = ?", [email]);
            if (rows.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const salt = bcrypt.genSaltSync(10);
            const securedPassword = bcrypt.hashSync(password, salt);

            const [insertResult] = await pool.query(
                "INSERT INTO drivers (name, password, email, contactNumber) VALUES (?, ?, ?, ?)",
                [name, securedPassword, email, contactNumber]
            );

            const data = {
                user: {
                    id: insertResult.insertId,
                    type: "driver"  // Setting the user type here
                }
            };
            const authid = jwt.sign(data, SECRET);

            res.json({
                success: true,
                authid,
                type: data.user.type  // Returning the user type
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

// Login driver
router.post("/logindriver",
    [
        body('email', "Invalid Credentials").isEmail(),
        body('password', "Invalid Credentials").isLength({ min: 8 })
    ],
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ success: false });
        }

        const { email, password } = req.body;
        try {
            const [rows] = await pool.query("SELECT * FROM drivers WHERE email = ?", [email]);
            if (rows.length === 0) {
                return res.status(400).json({ success: false, message: "Please enter valid credentials" });
            }

            const user = rows[0];
            const isMatched = bcrypt.compareSync(password, user.password);
            if (!isMatched) {
                return res.status(400).json({ success: false, message: "Please enter valid credentials" });
            }

            const data = {
                user: {
                    id: user.id,
                    type: "driver"  // Setting the user type here
                }
            };
            const authid = jwt.sign(data, SECRET);

            res.json({
                success: true,
                authid,
                type: data.user.type  // Returning the user type
            });validationResult
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

export default router;