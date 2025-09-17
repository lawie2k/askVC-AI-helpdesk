const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);


router.get("/_health", (req, res) => {
    return res.status(200).json({ ok: true });
});

router.post("/login", async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        db.query(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            [email],
            async (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: "DATABASE ERROR", details: err.message });
                }

                if (!rows || rows.length === 0) {
                    return res.status(401).json({ error: "Invalid email or password" });
                }

                const user = rows[0];
                const passwordMatch = await bcrypt.compare(password, user.password_hash);
                if (!passwordMatch) {
                    return res.status(401).json({ error: "Invalid email or password" });
                }

                if (!JWT_SECRET) {
                    return res.status(500).json({ error: "Server misconfigured: missing JWT_SECRET" });
                }

                const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
                return res.status(200).json({ token, user: { id: user.id, email: user.email } });
            }
        );
    } catch (e) {
        return res.status(500).json({ error: "Unexpected error" });
    }
})


router.post("/register", async (req, res) => {
    try{
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({ error: "Email and password are required" });
        }

        db.query("SELECT id FROM users WHERE email=?",[email], async (err,rows)=>{
            if(err){
                return res.status(500).json({ error: "DATABASE ERROR", details: err.message });
            }
            if(rows.length>0){
                return res.status(409).json({ error: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

            db.query(
                "INSERT INTO users(email,password_hash) VALUES (?,?)",
                [email, hashedPassword],
                (insertErr, insertResult) => {
                    if (insertErr) return res.status(500).json({ error: "Failed to create user", details: insertErr.message });

               const userid = insertResult.insertId;

               return res.status(201).json({ userid, email });
                })
        })

    }catch(e){
        return res.status(500).json({ error: "Unexpected error" });
    }
})

module.exports = router;