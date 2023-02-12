const express = require('express');
const activitiesRouter = express.Router();
const {
    getAllActivities,
    createActivity,
    getActivityByName,
    getPublicRoutinesByActivity,
    getActivityById,
    updateActivity
} = require('../db')

const {requireUser} = require('./utlis')

// GET /api/activities/:activityId/routines
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
    const activityId = req.params.activityId
    try {
        const activity = await getActivityById(activityId)
        if (!activity) {
            res.send({
                error: 'UserExistsError',
                message: `Activity ${activityId} not found`,
                name: 'UserExistsError'
            })
        }
        const routines = await getPublicRoutinesByActivity(activity)
        res.send(
            routines
        )
    } catch ({ name, message }) {
        next({ name, message })
    }
})
// GET /api/activities
activitiesRouter.get('/', async (req, res, next) => {
    try {
        const activities = await getAllActivities()
        res.send(
            activities
        )
    } catch ({ name, message }) {
        next({ name, message });
    }
})
// POST /api/activities
activitiesRouter.post('/', requireUser, async (req, res, next) => {
    const { name, description } = req.body
    try {
        if (!req.headers.authorization) {
            res.status(401).send({
                error: "failed to getme",
                message: "You must be logged in to perform this action",
                name: "Please log in."
            })
        }
        const _activity = await getActivityByName(name)
        if (_activity) {
            res.send({
                error: 'Activity Error',
                message: `An activity with name ${name} already exists`,
                name: 'Activity error'
            });
        }else{
            const activity = await createActivity({
                name,
                description
            });
            res.send(activity)
        }
        


    } catch ({ name, message }) {
        next({ name, message })
    }
})
// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', async (req, res, next) => {
    try{
        const fields = req.body;
        const id = req.params.activityId
        const name = fields.name
        const checkActivity = await getActivityById(id)
        const checkName = await getActivityByName(name)
        const updatedFields = {}

        if(checkActivity){
            (checkName) ?
            res.send({
                error: 'error',
                message: `An activity with name ${name} already exists`,
                name: 'NameTaken'
            })
            :
            updatedFields.activity = await updateActivity({id, name:fields.name, description:fields.description});
            res.send(updatedFields.activity)
        }else{
            res.send({
                error: 'error',
                message: `Activity ${id} not found`,
                name: 'errorMessage'
            })
        }
    }catch(error){
        next(error)
    }

});
module.exports = activitiesRouter;