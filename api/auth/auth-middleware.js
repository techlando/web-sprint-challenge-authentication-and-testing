const { JWT_SECRET } = require("./secrets"); 
// const User = require('../users/users-model')
// const jwt = require('jsonwebtoken')
const db = require('../../data/dbConfig')
const User = require('../middleware/User-model')



const validateUsername = (req, res, next) => {
    if(!req.body.username || !req.body.password) {
        next({ status:422, message: "username and password required"})
    } else {
        next()
    }
}

const userNameExists = async (req, res, next) => {
    const [user] = await User.findBy({username: req.body.username})
      try {
        if(user) {
          next({ status: 401, message: "username taken"})
        } else {
          req.user = user
          next()
        }
      } catch (err) {
        next(err)
      }
    } 

// const userNameExists = async (req, res, next) => {
//     try {
//         const existing = await User.findBy({ username: req.body.username })
//         if(!existing) {
          
//           next()
//         }
//         else {next({ message: "username taken", status: 401 })}
//       } catch (err) {
//         next(err)
//       }
// }



module.exports = {
    validateUsername,
    userNameExists,
}