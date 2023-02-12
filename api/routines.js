require('dotenv').config()
const express = require('express');
const routineRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const {getAllRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutine,getRoutineActivitiesByRoutine, addActivityToRoutine} = require('../db')

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
routineRouter.patch('/:routineId', async (req, res, next) => {
    try{
        const user = req.user
        const {isPublic, name, goal} = req.body
        const routineId = req.params.routineId
        if(!user){
            res.send({
                error:"Authentication Error",
                name:"Unauthenticated",
                message:"You must be logged in to perform this action"
            })
        } else {
            const routine = await getRoutineById({id:routineId})
            if(routine.creatorId !== user.id){
                res.send(403,{
                    error:'Unauthorized',
                    name:'User id not match routine\'s creator id',
                    message:`User ${user.username} is not allowed to update ${routine.name}`
                })
            }
            const updated_routine = await updateRoutine({
                id:routineId,
                isPublic,
                name,
                goal
            })
            res.send(updated_routine)
        }
    } catch({name, message}){
        next({name, message})
    }
})
// DELETE /api/routines/:routineId
routineRouter.delete('/:routineId',async(req,res,next)=>{

    try{
        const user = req.user
        const {isPublic, name, goal} = req.body
        const routineId = req.params.routineId
        if(!user){
            res.send({
                error:"Authentication Error",
                name:"Unauthenticated",
                message:"You must be logged in to perform this action"
            })
        } else {
            const routine = await getRoutineById({id:routineId})
            if(routine.creatorId !== user.id){
                res.send(403,{
                    error:'Unauthorized',
                    name:'User id not match routine\'s creator id',
                    message:`User ${user.username} is not allowed to delete ${routine.name}`
                })
            }
             await destroyRoutine(
                routineId,
            )
            res.send(routine)
        }
        
    }catch({name,message}){
        next({name,message})
    }
 
})

// POST /api/routines/:routineId/activities
routineRouter.post('/:routineId/activities', async (req, res, next) => {
    const { routineId } = req.params;
    const { activityId, count, duration, } = req.body;
    const id = routineId;

    const [routines] = await getRoutineActivitiesByRoutine({ id });

    try {
          if (!routines) {
                const activityToRoutines = await addActivityToRoutine({routineId, activityId, count, duration});
                res.send(activityToRoutines);
          } else {
                res.status(403)
                res.send({
                      error: 'GetMeError',
                      name: '403',
                      message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
                });
          }
    } catch ({ name, message }) {
          next({ name, message })
    }
});

module.exports = routineRouter;
