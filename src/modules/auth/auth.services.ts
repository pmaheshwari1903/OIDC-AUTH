import ApiError from "../../common/utils/api-error.js"
import ApiResponse from "../../common/utils/api-response.js"
import { db, usersTable } from '../../common/db/index.js'
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt"
import crypto from 'crypto'
import { generateAccessToken, verifyAccessToken } from "../../common/utils/jwt.utils.js"


const hashToken = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex')
}

const showSignInPage = async () => {

}

const signIn = async ({ email, password }: { email: string; password: string }) => {
    if (!email.trim()) {
        throw new Error("Email is required");
    }

    if (!password.trim()) {
        throw new Error("Password is required");
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email))
    if (!user) throw new Error("User Not Found")

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

const showSignUpPage = async () => {

}

const signUp = async ({ firstName, lastName, profileImageUrl, email, password }: { firstName: string; lastName: string; profileImageUrl?: string; email: string; password: string; }) => {
    if (!firstName.trim()) {
        throw new Error("First name is required");
    }

    if (!lastName.trim()) {
        throw new Error("Last name is required");
    }

    if (!email.trim()) {
        throw new Error("Email is required");
    }

    if (!password.trim()) {
        throw new Error("Password is required");
    }

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

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
    }
}

export {
    showSignInPage,
    signIn,
    showSignUpPage,
    signUp
}