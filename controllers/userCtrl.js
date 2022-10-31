const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body;
            const user = await Users.findOne({email});
        
            // logic store data
            if(user) {
                return res.status(400).json({msg: "The email already exits."})
            }

            if(password.length < 6) {
                return res.status(400).json({msg: "Password must be at least 6 characters long."});
            }

            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = new Users({
                name, email, password:passwordHash,
            });

            // Save user to mongoose database
            await newUser.save();

            //  then create jsonwebtoken to authentication
            const accessToken = createAccessToken({id: newUser._id});
            const refreshToken = createRefreshToken({id: newUser._id});

            // store token to cookie 
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            });

            res.json({accessToken});
            // res.json({msg: "Register Success"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    }, 
    refreshToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken;
            if(!rf_token) {
                return res.status(400).json({msg: "please Login or Register"});
            } 
                   
            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                // throw err when token wrong
                if(err) {return res.status(400).json({msg: "please Login or Register"});}
                
                const accessToken = createAccessToken({id: user.id});
                
                // check user
                res.json({ accessToken });
            });
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    }
}

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2 days'});
}
const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '4 days'});
}

module.exports = userCtrl;