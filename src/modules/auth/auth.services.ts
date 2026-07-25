import ApiError from "../../common/utils/api-error.js"
import { db, usersTable } from '../../common/db/index.js'
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt"
import crypto from 'crypto'
import { generateAccessToken, verifyAccessToken } from "../../common/utils/jwt.utils.js"
import { sendVerificationEmail, sendPasswordResetEmail } from "../../common/utils/mailer.js"


const hashToken = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex')
}


const signIn = async ({ email, password }: { email: string; password: string }) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email))
    if (!user) throw new Error("User Not Found")

    if (!user.emailVerified) throw new Error("Please verify your email address to log in.")

    if (!user.password) throw new Error("Password not set")
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new Error("Invalid password")

    // Generating AccessToken
    const accessToken = generateAccessToken({
        id: user.id,
        email: user.email
    })

    return {
        accessToken,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
        }
    }

}


const signUp = async ({ firstName, lastName, profileImageUrl, email, password }: { firstName: string; lastName: string; profileImageUrl?: string; email: string; password: string; }) => {
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email))
    if (existingUser) throw new Error("User Already Exists")

    const hashedPassword = await bcrypt.hash(password, 10)

    const [user] = await db.insert(usersTable).values({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profileImageUrl,
        email: email.trim(),
        password: hashedPassword,
    }).returning()

    // Send the Verification Email
    const verificationToken = generateAccessToken({ id: user.id });
    await sendVerificationEmail(user.email, verificationToken);

    return {
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
        }
    }
}

const verifyEmail = async (token: string) => {
    if (!token) throw new Error("No token provided");
    const decoded = verifyAccessToken(token) as { id: string };
    if (!decoded || !decoded.id) throw new Error("Invalid or expired token");

    await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.id, decoded.id));
};

const forgotPassword = async (email: string) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.trim()));
    if (!user) {
        // We don't throw an error to prevent email enumeration, just return silently
        return;
    }

    const resetToken = generateAccessToken({ id: user.id, purpose: "reset_password" });
    await sendPasswordResetEmail(user.email, resetToken);
}

const resetPassword = async (token: string, newPassword: string) => {
    if (!token) throw new Error("No token provided");
    if (!newPassword || newPassword.length < 6) throw new Error("Invalid password (minimum 6 characters)");

    let decoded;
    try {
        decoded = verifyAccessToken(token) as { id: string, purpose?: string };
    } catch (e) {
        throw new Error("Invalid or expired token");
    }

    if (!decoded || !decoded.id || decoded.purpose !== "reset_password") {
        throw new Error("Invalid or expired token for password reset");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable).set({ password: hashedPassword }).where(eq(usersTable.id, decoded.id));
}

export {
    signIn,
    signUp,
    verifyEmail,
    forgotPassword,
    resetPassword
}