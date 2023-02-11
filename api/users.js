const express = require("express");
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { createUser, getUserByUsername, getUser, getAllRoutinesByUser, getPublicRoutinesByUser } = require('../db')

usersRouter.use((req, res, next) => {
    console.log('User req being made')
    next();
})
// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const ExistingUser = await getUserByUsername(username);

        if (ExistingUser) {
            res.send({
                error: 'UserExistsError',
                message: `User ${username} is already taken.`,
                name: 'UserExistsError'
            });
        }
        if (password.length < 8) {
            res.send({
                error: 'PasswordTooShortError',
                message: 'Password Too Short!',
                name: 'Password Too Short!'
            });
        }
        const user = await createUser({
            username,
            password
        });

        const token = jwt.sign({
            id: user.id,
            username
      }, process.env.JWT_SECRET, {
            expiresIn: '1w'
      });

        res.send({
            message: "Sign-up Successful!",
            token,
            user
        });
    } catch ({ name, message }) {
        next({ name, message })
    }
});
// POST /api/users/login
usersRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        res.send({
            name: 'MissingUserOrPassword',
            message: 'Must enter username and password',
            error: 'error'
        });
    }
    try {
        const user = await getUser({ username, password });
        if (user) {
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
            res.send({ message: "you're logged in!", token, user });
        } else {
            res.send({
                name: 'incorrect',
                message: "incorrect user name or password"
            });
        }
    } catch (error) {
        throw new Error('unable to log in');
    }
});
// GET /api/users/me
usersRouter.get('/me', async (req, res) => {
    try {
        if (req.headers.authorization) {
            const userToken = req.headers.authorization
            const token = userToken.split(' ');
            const data = jwt.verify(token[1], JWT_SECRET);
            res.send({
                id: data.id, username: data.username
            })
        }
        if (!req.headers.authorization) {
            res.status(401).send({
                error: "failed to getme",
                message: "You must be logged in to perform this action",
                name: "Please log in."
            })
        }
    } catch (error) {
        throw Error('no user');
    }
})
// GET /api/users/:username/routines
usersRouter.get(`/:username/routines`,async(req,res) =>{
    const username = req.params.username
    try{
        if(username){
            const userRoutines = await getAllRoutinesByUser({username});
            const publicRoutines = await getPublicRoutinesByUser({username})
            console.log(publicRoutines, userRoutines)
            res.send({ ...publicRoutines, ...userRoutines }); 
       }else{
            return null;
        }
    }catch(error){
        throw Error('Failed to get', error)
    }
})

module.exports = usersRouter;