const express = require('express');
const routineRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const {getAllRoutines, createRoutine, getRoutineById, updateRoutine} = require('../db')

// GET /api/routines
routineRouter.get('/',async(req,res,next)=>{
    try{
        const routines = await getAllRoutines();
      //  console.log(routines)
        if(routines){
            res.send(routines)
        }

    }catch(error){
        throw Error("Failed to get", error)
    }
})
// POST /api/routines
routineRouter.post('/', async (req, res, next) => {


    const { isPublic, name, goal } = req.body;
    try {

          if (req.headers.authorization) {
                const usertoken = req.headers.authorization;
                const token = usertoken.split(' ');
                const data = jwt.verify(token[1], JWT_SECRET);

  
                const creatorId = data.id;
                const routine = await createRoutine({ creatorId, isPublic, name, goal })

                res.send(routine);

          } else {
                res.status(401)
                res.send({
                      error: 'GetMeError',
                      name: '401',
                      message: 'You must be logged in to perform this action'
                });
          }

    } catch ({ name, message }) {
          next({ name, message })
    }
});
// PATCH /api/routines/:routineId
routineRouter.patch('/:routineId',async(req,res,next)=>{
    const { routineId } = req.params;
    const { isPublic , name , goal } = req.body;
    const id = routineId;

    try{
        if(!req.header.authorization){
            res.status(403)
            res.send({
                error: 'GetMeError',
                name: '403',
                message: 'You must be logged in to perform this action'
            })
            
        }

        const routine = await getRoutineById(id);
        const creatorId = routine.creatorId;

        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const data = jwt.verify(token[1], JWT_SECRET);

        if(data.id === creatorId){
            const routine = await updateRoutine({id,isPublic,name,goal});
            res.send(routine)
        }else{
            res.status(403)
            res.send({
                error:'GetMeError',
                name:'403',
                message:`User ${data.username} is not allowed to update Every`

            })
        }



    }catch({ error, message, name }){
        next({ error, message, name })
    }
})
// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = routineRouter;
