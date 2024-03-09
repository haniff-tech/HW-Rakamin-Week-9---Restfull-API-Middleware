var jwt = require('jsonwebtoken')

const verifyToken = (token) => {
    const data = jwt.verify(token, process.env.JWT_KEY)
    return data
}

const signToken = (data) => {
    const token = jwt.sign(data, process.env.JWT_KEY, { expiresIn: '1h'})
    return token
}

module.exports = {
    signToken,
    verifyToken
}

