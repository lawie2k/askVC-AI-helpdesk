const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prismaClient");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-not-for-prod';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);


async function getUserById(userId) {
    const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
        select: { id: true, email: true, password_hashed: true },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

function updateUserPassword(userId, hashedPassword) {
    return prisma.users.update({
        where: { id: Number(userId) },
        data: { password_hashed: hashedPassword },
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

        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hashed);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        if (!JWT_SECRET) {
            return res.status(500).json({ error: "Server misconfigured: missing JWT_SECRET" });
        }

        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({ token, user: { id: user.id, email: user.email } });
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

        const existing = await prisma.users.findUnique({
            where: { email },
        });

        if (existing) {
            return res.status(409).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = await prisma.users.create({
            data: {
                email,
                password_hashed: hashedPassword,
            },
        });

        return res.status(201).json({ userid: user.id, email: user.email });
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

        const admin = await prisma.admins.findUnique({
            where: { username },
        });

        if (!admin) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password_hashed);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        const token = jwt.sign({ sub: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({ token, admin: { id: admin.id, username: admin.username } });
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

        const existing = await prisma.admins.findUnique({
            where: { username },
        });

        if (existing) {
            return res.status(409).json({ error: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

        const admin = await prisma.admins.create({
            data: {
                username,
                password_hashed: hashedPassword,
            },
        });
        return res.status(201).json({ adminId: admin.id, username: admin.username });
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