/* eslint-disable no-undef */
const client = require("./client");
const { attachActivitiesToRoutines,getActivityById  } = require('./activities')


async function createRoutine({ creatorId, isPublic, name, goal }) {

  //eslint-disable-next-line no-useless-catch
  try {
      const { rows:[routine]} = await client.query(`
      INSERT INTO routines ("creatorId","isPublic",name, goal)
      VALUES ($1,$2,$3,$4)
      RETURNING id,"creatorId","isPublic",name,goal
      `, [creatorId,isPublic,name,goal]);
      
      console.log(routine);
      return routine;
  
    } catch (error) {
       throw error;
    }
}

async function getRoutineById(routineId) {

  //eslint-disable-next-line no-useless-catch
  try {
    const { rows } = await client.query(`
    SELECT * FROM routines
    WHERE id=${routineId};
    `);

    const [routine] = rows;
    return routine;

  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {

  //eslint-disable-next-line no-useless-catch
  try {
    const { rows:routines} = await client.query(`
      SELECT routines.* ,
      users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id = routines."creatorId";
      `);

      for (let i = 0; i < routines.length; i++) {
        routines[i].activities = await attachActivitiesToRoutines (routines[i]);
      }
    
    console.log(routines);
    return routines;

  } catch (error) {
    throw error;
  }
}
 

async function getRoutinesWithoutActivities() {
  //eslint-disable-next-line no-useless-catch

  //eslint-disable-next-line no-useless-catch
  try {
    const { rows:routine} = await client.query(`
      SELECT routines.* ,
      users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id = routines."creatorId";
      `);

      console.log(routine);
      return routine;
  
    } catch (error) {
      throw error;
    }
  }

async function getAllPublicRoutines() {
  //eslint-disable-next-line no-useless-catch
   try {
    const { rows:routines} = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id = routines."creatorId"
      WHERE "isPublic" = true;
      `);


      for (let i = 0; i < routines.length; i++) {
        routines[i].activities = await attachActivitiesToRoutines (routines[i]);
      }

     console.log(routines);
     return routines;

  } catch (error) {
    throw error;
  }
  }


async function getAllRoutinesByUser({ username }) {

//eslint-disable-next-line no-useless-catch
try {
  const { rows:routines} = await client.query(`
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON users.id = routines."creatorId"
    WHERE users.username = $1;
    `,[username]);

    if (!routines) return null;


    for (let i = 0; i < routines.length; i++) {
      routines[i].activities = await attachActivitiesToRoutines (routines[i]);
    }

   console.log(routines);
   return routines;

} catch (error) {
  throw error;
}

}

async function getPublicRoutinesByUser({ username }) {

//eslint-disable-next-line no-useless-catch
try {
  const { rows:routines} = await client.query(`
  SELECT routines.*, users.username AS "creatorName" 
  FROM routines
  JOIN users ON users.id = routines."creatorId"
  WHERE users.username = $1 AND "isPublic" = true;
    `,[username]);

    if (!routines) return null;
   
    for (let i = 0; i < routines.length; i++) {
      routines[i].activities = await attachActivitiesToRoutines (routines[i]);
    }

   console.log(routines);
   return routines;

} catch (error) {
  throw error;
}
}

async function getPublicRoutinesByActivity({ activityId }) {

  //eslint-disable-next-line no-useless-catch
  try{
  const activity = await getActivityById (activityId);
  const routines = await getAllPublicRoutines(activity);

   console.log(routines);
   return routines;

  //  try {
  //   const pubRoutines = await getAllPublicRoutines()
  //   for (let i=0; i< pubRoutines.length; i++) {
  //     const routine = pubRoutines[i]
  //     const actRoutine = routine.activities.filter(act => act.id === id)
  //     if (actRoutine.length > 0) {
  //       const routine = await getRoutineById(actRoutine[0].routineId)
  //       return routine
  //     }
  //   }

} catch (error) {
  throw error;
}

}

async function updateRoutine({ id, ...fields }) {

  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
).join(', ');


  if (setString.length === 0) {
    return;
  }

  //eslint-disable-next-line no-useless-catch
  try {
    const { rows: [routine] } = await client.query(`
    UPDATE routines
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `, Object.values(fields),);

    // Another way:
    // const { isPublic, name , goal} = fields
    // let returned
    // if(!isPublic !== null && isPublic !== undefined){
    //   const {rows:[updated]} = await client.query(`
    //   UPDATE routines
    //   SET "isPublic" = $1
    //   WHERE id=$2
    //   RETURNING *
    //   `,[isPublic,id])

    //   returned = updated

    return routine;

  }catch (error){
    throw error;
  }
}

async function destroyRoutine(id) {
    //eslint-disable-next-line no-useless-catch
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
      `)

    }catch (error){
      throw error;
    }
  }

module.exports = {
  createRoutine,
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  updateRoutine,
  destroyRoutine,
};
