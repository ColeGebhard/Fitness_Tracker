const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities")

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [routine] } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1,$2,$3,$4)
    RETURNING *;
    `, [creatorId, isPublic, name, goal])
    return routine;
  } catch (error) {
    throw Error(error)
  }
}


async function getRoutineById(id) {
  try {

    const routines = await getAllRoutines()

    const routineById = routines.filter(routine => routine.id === id)
    if (routineById.length) {
      return routineById
    } else {
      return false
    }
  } catch (error) {
    throw new Error('cant get routine by id')
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routine } = await client.query(`
    SELECT * 
    FROM routines;`);
    return routine
  } catch (error) {
    throw new Error('cant get routines')
  }
 }

async function getAllRoutines() {
  try {
    const { rows: routine } = await client.query(`
    SELECT routines.*,
    users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId";
    `);

    for (let i = 0; i < routine.length; i++) {
      routine[i].activities = await attachActivitiesToRoutines(routine[i])
    }

    return routine;
  } catch (error) {
    return error;
  }
}

async function getAllPublicRoutines() {
  try {
    const routines = await getAllRoutines()
    const pubRoutines = routines.filter(routine => routine && routine.isPublic === true);
 
    return pubRoutines
  } catch (error) { throw new Error('cant get puplic routines') }
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
  try {
    const publicRoutines = await getAllPublicRoutines()
    const userRoutines = publicRoutines.filter(publicRoutines => publicRoutines && publicRoutines.creatorName === username)
    return userRoutines
  } catch (error) {
    throw Error(error)
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const pubRoutines = await getAllPublicRoutines()
    for (let i=0; i< pubRoutines.length; i++) {
      const routine = pubRoutines[i]
      const actRoutine = routine.activities.filter(act => act.id === id)
      if (actRoutine.length > 0) {
        const routine = await getRoutineById(actRoutine[0].routineId)
        return routine
      }
    }

  } catch (error) {
    throw new Error('can get public routines by Actvity')
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const { isPublic, name, goal } = fields
    let returned
    if (!isPublic !== null && isPublic !== undefined) {
      const { rows: [updated] } = await client.query(`
      UPDATE routines
      SET "isPublic" = $1
      WHERE id=$2
      RETURNING *
      `, [isPublic, id])
      returned = updated
    }
    if (name) {
      const { rows: [updated] } = await client.query(`
      UPDATE routines
      SET name = $1
      WHERE id=$2
      RETURNING *
      `, [name, id])
      returned = updated
    }
    if (goal) {
      const { rows: [updated] } = await client.query(`
    UPDATE routines
    set goal=$1
    WHERE id=$2
    RETURNING *
    `, [goal, id])
      returned = updated
    }
    if (isPublic === undefined && name === undefined && goal === undefined) {
      throw Error('No Imput')
    }
    return returned
  } catch (error) {
    throw Error("failed to update", error)
  }
}

async function destroyRoutine(id) {
  try {
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
  } catch (error) {
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
