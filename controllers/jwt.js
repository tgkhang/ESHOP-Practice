'user strict';

const jwt= require('jsonwebtoken');

const JWT_SECRET= 'abcd';

function sign(email,expiresIn="30m")
{
    return jwt.sign(
        {email},
        process.env.JWT_SECRET || JWT_SECRET,
        {expiresIn:expiresIn}
    )
}

function verify(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
        console.log("Token verified successfully:", decoded);
        return true;
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return false;
    }
}

module.exports= {sign,verify};