const client = require("./client");
const { attachActivitiesToRoutines, getActivityById } = require("./activities")

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try{
    const {rows:[routine]} = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1,$2,$3,$4)
    RETURNING *;
    `,[creatorId, isPublic, name, goal])
    return routine;
  }catch(error){
    throw Error(error)
  }
}

async function getRoutineById(id) {}

async function getRoutinesWithoutActivities() {}

async function getAllRoutines() {
  try{
    const {rows: routine} = await client.query(`
    SELECT routines.*,
    users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId";
    `);

    for (let i = 0; i < routine.length; i++) {
      routine[i].activities = await attachActivitiesToRoutines(routine[i])
    }

    return routine;
  } catch (error){
    return error;
  }
}

async function getAllPublicRoutines() {
  try{
    const {rows: routine} = await client.query(`
    SELECT routines.*,
    users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId"
    WHERE "isPublic" = true;
    `);

    for (let i = 0; i < routine.length; i++) {
      routine[i].activities = await attachActivitiesToRoutines(routine[i])
    }

    return routine;
  } catch (error){
    return error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try{
    const allRoutines = await getAllRoutines()
    const routineByUsers = allRoutines.filter(allRoutines => allRoutines && allRoutines.creatorName === username)
    return routineByUsers
  }catch(error){
    throw Error("Failed to get RgetAllPublicRoutinesoutines by user",error)
  }
}

async function getPublicRoutinesByUser({ username }) {
  try{
    const publicRoutines = await getAllPublicRoutines()
    const userRoutines = publicRoutines.filter(publicRoutines => publicRoutines && publicRoutines.creatorName === username)
    return userRoutines
  }catch(error){
    throw Error(error)
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try{
    const activity = await getActivityById( id );
    const routines = await getAllPublicRoutines(activity)
    // const selectedRoutine = routines.filter(routines => routines.activities.id  === id)

    return routines;

  }catch(error){
    throw Error(error)
  }
}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {
 
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
