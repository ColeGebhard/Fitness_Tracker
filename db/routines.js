const client = require("./client");
const { attachActivitiesToRoutines, getActivityById } = require('./activities')


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

async function getRoutineById({id}) {
  try{
    const {rows:[routine]} = await client.query(`
    SELECT *
    FROM routines
    WHERE id=$1
    `,[id])
    return routine
    
  }catch(error){
    throw Error(error)
  }
}

async function getRoutinesWithoutActivities() {
  try{
    const {rows: routinesWithout } = await client.query(`
    SELECT *
    FROM routines
    `)
    return routinesWithout
  }catch(error){
    throw Error(error)
  }
}



async function getAllRoutines() {
  try{
    const {rows: routines} = await client.query(`
    SELECT routines.*,
    users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId";
    `);

    for(let i = 0 ; i< routines.length; i++){
      routines[i].activities = await attachActivitiesToRoutines(routines[i])
    }
 
    console.log(routines)
    return routines;
  } catch (error){
    return error;
  }
}


async function getAllPublicRoutines() {
  try{
    const {rows: routines} = await client.query(`
    SELECT routines.*,
    users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId"
    WHERE "isPublic"=true;
    `);

    for(let i = 0 ; i< routines.length; i++){
      routines[i].activities = await attachActivitiesToRoutines(routines[i])
    }
 
    console.log(routines)
    return routines;
  } catch (error){
    return error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const allRoutines = await getAllRoutines()
    const routineByUsers = allRoutines.filter(allRoutines => allRoutines && allRoutines.creatorName === username)
    return routineByUsers
  } catch (error) {
    throw Error("Failed to get RgetAllPublicRoutinesoutines by user", error)
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

    const routines = await getAllPublicRoutines()
    const filtered = routines.filter(routine => {
      for (activity of routine.activities){
        if(activity.id === id){
          return true
        }
      }
      return false
    })

    return filtered;
  }catch(error){
    throw Error(error)
  }
}

async function updateRoutine({ id, ...fields }) {
  try{
    const { isPublic, name , goal} = fields

    let returned

    if(!isPublic !== null && isPublic !== undefined){
      const {rows:[updated]} = await client.query(`
      UPDATE routines
      SET "isPublic" = $1
      WHERE id=$2
      RETURNING *

      `,[isPublic,id])

      returned = updated
    }

    if(name){
      const {rows:[updated]} = await client.query(`
      UPDATE routines
      SET name = $1
      WHERE id=$2
      RETURNING *

      `,[name,id])

      returned = updated
    }
  if(goal){
    const {rows:[updated]} = await client.query(`
    UPDATE routines
    set goal=$1
    WHERE id=$2
    RETURNING *
    `,[goal,id])
    returned = updated
  }

  if(isPublic === undefined && name === undefined && goal === undefined){
    throw Error('No Imput')
  }

  return returned

  }catch(error){
    throw Error("failed to update",error)
  }

}

async function destroyRoutine(id) {
  try{

    await client.query(`
    DELETE FROM 
    routine_activities
    WHERE "routineId" =${id}
    `);

    await client.query(`
    DELETE FROM 
    routines 
    WHERE id=${id}
  
    `);
    
 
    

  
  }catch(error){
    throw Error('Failed to delete', error)
  }
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
