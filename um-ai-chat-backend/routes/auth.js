const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prismaClient");
const { sendPasswordResetEmail, sendAdminPasswordResetEmail } = require("../services/email-service");
const { authenticateAdmin } = require("./middleware/adminAuth");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-not-for-prod';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
const RESET_CODE_TTL_MINUTES = parseInt(process.env.RESET_CODE_TTL_MINUTES || "10", 10);


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

        // Update last_active_at on successful login
        try {
            await prisma.users.update({
                where: { id: user.id },
                data: { last_active_at: new Date() },
            });
        } catch (activityErr) {
            console.error("Failed to update last_active_at on login:", activityErr);
            // Don't block login if this fails
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
                // Consider newly registered users as active at registration time
                last_active_at: new Date(),
            },
        });

        return res.status(201).json({ userid: user.id, email: user.email });
    }catch(e){
        return res.status(500).json({ error: "Unexpected error" });
    }
})

function generateResetCode() {
    return crypto.randomInt(100000, 999999).toString();
}

async function invalidateExistingTokens(userId) {
    await prisma.password_reset_tokens.updateMany({
        where: { user_id: Number(userId), used: false },
        data: { used: true },
    });
}

router.post("/reset-password", async (req, res) => {
    const { oldPassword, newPassword, userid } = req.body;
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

router.post("/request-password-reset", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            // Do not reveal if user exists
            return res.status(200).json({ message: "If the email exists, a reset code has been sent." });
        }

        await invalidateExistingTokens(user.id);
        const code = generateResetCode();
        const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
        const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);

        await prisma.password_reset_tokens.create({
            data: {
                user_id: user.id,
                code_hash: codeHash,
                expires_at: expiresAt,
            },
        });

        await sendPasswordResetEmail(email, code);

        return res.status(200).json({
            message: "If the email exists, a reset code has been sent.",
            expiresInMinutes: RESET_CODE_TTL_MINUTES,
        });
    } catch (e) {
        console.error("Error requesting password reset:", e);
        // Keep a generic error for the client; details are only in server logs
        return res.status(500).json({ error: "Unable to process password reset request" });
    }
});

router.post("/verify-password-reset", async (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ error: "Email, code, and newPassword are required" });
    }

    try {
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired code" });
        }

        const tokenRecord = await prisma.password_reset_tokens.findFirst({
            where: {
                user_id: user.id,
                used: false,
                expires_at: { gt: new Date() },
            },
            orderBy: { created_at: "desc" },
        });

        if (!tokenRecord) {
            return res.status(400).json({ error: "Invalid or expired code" });
        }

        const isCodeValid = await bcrypt.compare(code, tokenRecord.code_hash);
        if (!isCodeValid) {
            return res.status(400).json({ error: "Invalid or expired code" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        await prisma.$transaction([
            prisma.users.update({
                where: { id: user.id },
                data: { password_hashed: hashedNewPassword },
            }),
            prisma.password_reset_tokens.update({
                where: { id: tokenRecord.id },
                data: { used: true },
            }),
        ]);

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (e) {
        console.error("Error verifying password reset:", e);
        return res.status(500).json({ error: "Unable to reset password" });
    }
});

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

router.post("/admin/change-password", authenticateAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current password and new password are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: "New password must be at least 8 characters long" });
        }

        const admin = await prisma.admins.findUnique({
            where: { id: adminId },
        });

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, admin.password_hashed);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        // Update password
        await prisma.admins.update({
            where: { id: adminId },
            data: { password_hashed: hashedNewPassword },
        });

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (e) {
        console.error("Error changing password:", e);
        return res.status(500).json({ error: "Unable to change password" });
    }
})

// Admin forgot password - generates a reset code for admin use
router.post("/admin/forgot-password", async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        const admin = await prisma.admins.findUnique({
            where: { username },
        });

        if (!admin) {
            // Don't reveal if admin exists for security
            return res.status(200).json({
                message: "If the username exists, a reset code has been sent to the admin email.",
            });
        }

        // Invalidate any existing reset tokens for this admin
        await prisma.password_reset_tokens.deleteMany({
            where: { user_id: -admin.id } // Negative to indicate admin
        });

        // Generate a 6-digit reset code
        const resetCode = generateResetCode();
        const codeHash = await bcrypt.hash(resetCode, BCRYPT_ROUNDS);
        const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);

        // Store the reset token using the existing password_reset_tokens table
        // We'll use a negative user_id to distinguish admin tokens
        await prisma.password_reset_tokens.create({
            data: {
                user_id: -admin.id, // Negative to indicate admin
                code_hash: codeHash,
                expires_at: expiresAt,
            },
        });

        // Send reset code via email to the specified admin email
        const adminEmail = "a.siojo.143903.tc@umindanao.edu.ph";

        try {
            await sendAdminPasswordResetEmail(adminEmail, resetCode);
            console.log(`🔐 ADMIN PASSWORD RESET CODE sent to email for "${username}"`);
            console.log(`📧 Email sent to: ${adminEmail}`);
        } catch (emailError) {
            console.error(`❌ Email failed, falling back to server logs:`, emailError.message);
            console.log(`🔐 ADMIN PASSWORD RESET CODE for "${username}": ${resetCode}`);
            console.log(`⏰ Code expires at: ${expiresAt.toISOString()}`);
            console.log(`📝 To reset: POST /auth/admin/reset-password with { username, code, newPassword }`);
        }

        console.log(`⏰ Code expires at: ${expiresAt.toISOString()}`);

        return res.status(200).json({
            message: "If the username exists, a reset code has been sent to the admin email.",
            expiresInMinutes: RESET_CODE_TTL_MINUTES
        });

    } catch (e) {
        console.error("Error requesting admin password reset:", e);
        return res.status(500).json({ error: "Unable to process password reset request" });
    }
})

// Admin reset password using code
router.post("/admin/reset-password", async (req, res) => {
    try {
        const { username, code, newPassword } = req.body;

        if (!username || !code || !newPassword) {
            return res.status(400).json({ error: "Username, code, and newPassword are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: "New password must be at least 8 characters long" });
        }

        const admin = await prisma.admins.findUnique({
            where: { username },
        });

        if (!admin) {
            return res.status(400).json({ error: "Invalid or expired code" });
        }

        // Find the most recent valid reset token for this admin
        const tokenRecord = await prisma.password_reset_tokens.findFirst({
            where: {
                user_id: -admin.id, // Negative to indicate admin
                used: false,
                expires_at: { gt: new Date() },
            },
            orderBy: { created_at: "desc" },
        });

        if (!tokenRecord) {
            return res.status(400).json({ error: "Invalid or expired code" });
        }

        // Verify the reset code
        const isCodeValid = await bcrypt.compare(code, tokenRecord.code_hash);
        if (!isCodeValid) {
            return res.status(400).json({ error: "Invalid or expired code" });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        // Update admin password and mark token as used in a transaction
        await prisma.$transaction([
            prisma.admins.update({
                where: { id: admin.id },
                data: { password_hashed: hashedNewPassword },
            }),
            prisma.password_reset_tokens.update({
                where: { id: tokenRecord.id },
                data: { used: true },
            }),
        ]);

        console.log(`✅ Admin password reset successful for: ${username}`);
        return res.status(200).json({ message: "Password reset successfully" });

    } catch (e) {
        console.error("Error resetting admin password:", e);
        return res.status(500).json({ error: "Unable to reset password" });
    }
})


module.exports = router;