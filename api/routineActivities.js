const express = require('express');
const rActivitiesRouter = express.Router();

const {
    updateRoutineActivity,
    canEditRoutineActivity,
    destroyRoutineActivity
    
}=require('../db')

// PATCH /api/routine_activities/:routineActivityId
rActivitiesRouter.patch('/:routineActivityId',async(req,res,next)=>{
    try{
        const routineActivityId = parseInt(req.params.routineActivityId);
        const userId = req.user.id;
        const edit = await canEditRoutineActivity(routineActivityId,userId)
        const fields = req.body;
        fields.id = routineActivityId

        if(edit){
            const editedRoutine = await updateRoutineActivity(fields)
            res.send(editedRoutine)
        }else{
            res.send({
                 error:'must own routine activity to be able to edit',
                message:`User ${req.user.username} is not allowed to update In the evening`,
                name:'NotOwner'
            })
        }

    }catch(error){
        next(error)
    }
})
// DELETE /api/routine_activities/:routineActivityId
rActivitiesRouter.delete('/:routineActivityId',async(req,res,next)=>{
    try{
        const routineActivityId = parseInt(req.params.routineActivityId);
        const userId = req.user.id;
        const destroy = await canEditRoutineActivity(routineActivityId,userId)

        if(destroy){
            const deleteRoutine = await destroyRoutineActivity(routineActivityId)
            res.send(deleteRoutine)
        }else{
            res.status(403)
            res.send({
                error:'Error',
                message:`User ${req.user.username} is not allowed to delete In the afternoon`,
                name:'403'
            })
        }

    }catch(error){
        next(error)
    }
})
module.exports = rActivitiesRouter;