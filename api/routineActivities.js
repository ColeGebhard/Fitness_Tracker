const express = require('express');
const rActivitiesRouter = express.Router();

const {updateRoutineActivity,canEditRoutineActivity}=require('../db')

// PATCH /api/routine_activities/:routineActivityId

// DELETE /api/routine_activities/:routineActivityId

module.exports = rActivitiesRouter;
