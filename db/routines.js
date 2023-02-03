const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try{
    const {rows:[routine]} = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1,$2,$3,$4)
    RETURNING *;
    `,[creatorId, isPublic, name, goal])
    console.log(routine)
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
    console.log(routine)
    return routine;
  } catch (error){
    return error;
  }
}


async function getAllPublicRoutines() {
  try{
    const {rows: publicRoutines} = await client.query(`
    SELECT * 
    FROM routines 
    WHERE "isPublic" = true
    `)
    console.log(publicRoutines)
    return publicRoutines
  }catch(error){
    throw Error(error)
  }
}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

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
