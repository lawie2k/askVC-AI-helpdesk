const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-not-for-prod';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);

// Helper functions for reset password
function getUserById(userId) {
    return new Promise((resolve, reject) => {
        db.query("SELECT id, email, password_hashed FROM users WHERE id = ?", [userId], (err, rows) => {
            if (err) reject(err);
            else if (rows.length === 0) reject(new Error("User not found"));
            else resolve(rows[0]);
        });
    });
}

function updateUserPassword(userId, hashedPassword) {
    return new Promise((resolve, reject) => {
        db.query("UPDATE users SET password_hashed = ? WHERE id = ?", [hashedPassword, userId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}


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
            "SELECT id, email, password_hashed FROM users WHERE email = ?",
            [email],
            async (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: "DATABASE ERROR", details: err.message });
                }

                if (!rows || rows.length === 0) {
                    return res.status(401).json({ error: "Invalid email or password" });
                }

                const user = rows[0];
                const passwordMatch = await bcrypt.compare(password, user.password_hashed);
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
                "INSERT INTO users(email,password_hashed) VALUES (?,?)",
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

router.post("/reset-password", async (req, res) => {
    const { oldPassword, newPassword,userid } = req.body;
    try{
        const user = await getUserById(userid);
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hashed);
        if(!isOldPasswordValid){
            return res.status(401).json({ error: "Invalid old password" });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        await updateUserPassword(userid, hashedNewPassword);
        
        return res.status(200).json({ message: "Password reset successfully" });
    }catch(e){
        return res.status(500).json({ error: "Unexpected error" });
    }
})

router.post("/admin/login", async (req, res) => {
    try{
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        db.query(
            "SELECT id, username, password_hashed FROM admins WHERE username = ?",
            [username],
            async(err, rows) => {
                if (err) {
                    return res.status(500).json({ error: "DATABASE ERROR", details: err.message });
                }
                if (!rows || rows.length === 0) {
                    return res.status(401).json({ error: "Invalid username or password" });
                }
                const admin = rows[0];
                const passwordMatch = await bcrypt.compare(password, admin.password_hashed);
                if (!passwordMatch) {
                    return res.status(401).json({ error: "Invalid username or password" });
                }
                const token = jwt.sign({ sub: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: "7d" });
                return res.status(200).json({ token, admin: { id: admin.id, username: admin.username } });
            })
    }catch(e){
        return res.status(500).json({ error: "Unexpected error" });
    }
})

router.post("/admin/register", async (req, res) => {
    try{
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        db.query("SELECT id FROM admins WHERE username = ?", [username], async (err, rows) => {
            if (err) {
                return res.status(500).json({ error: "DATABASE ERROR", details: err.message });
            }
            if (rows.length > 0) {
                return res.status(409).json({ error: "Admin already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

            db.query(
                "INSERT INTO admins(username, password_hashed) VALUES (?, ?)",
                [username, hashedPassword],
                (insertErr, insertResult) => {
                    if (insertErr) return res.status(500).json({ error: "Failed to create admin", details: insertErr.message });

                    const adminId = insertResult.insertId;
                    return res.status(201).json({ adminId, username });
                })
        })
    }catch(e){
        return res.status(500).json({ error: "Unexpected error" });
    }
})

router.post("/admin/logout", async (req, res) => {
    try {
        const { username } = req.body;

        console.log(`Admin logout: ${username || 'Unknown'} at ${new Date().toISOString()}`);
        

        return res.status(200).json({ 
            message: "Logout successful",
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        return res.status(500).json({ error: "Unexpected error" });
    }
})


module.exports = router;