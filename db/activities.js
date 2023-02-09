const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new 
  try {
    const { rows: [activity] } = await client.query(`
     INSERT INTO activities(name,description)
     VALUES($1,$2)
     RETURNING *;
     `, [name, description]);

    return activity;
  } catch (error) {
    throw Error('failed to create activity')
  }
}

async function getAllActivities() {
  // const allActivities = [];

  try {
    const { rows } = await client.query(`
      SELECT * 
      FROM activities;
      `);

    // allActivities.push(activity);
    return rows;
  } catch (error) {
    throw Error('cannot get activity')
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT * FROM activities
    WHERE id=${id};
    `);

    return activity;
  } catch (error) {
    throw Error('Cannot get activities')
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT * FROM activities
    WHERE name=$1;
    `, [name]);

    return activity;
  } catch (error) {
    throw Error('Cannot get activities')
  }
}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
  try {
    const { rows : activity } = await client.query(`
    SELECT activities.*,
    routine_activities."routineId",
    routine_activities."activityId",
    routine_activities.duration,
    routine_activities.id AS "routineActivityId",
    routine_activities.count
    FROM activities
    JOIN routine_activities
    ON routine_activities."activityId" = activities.id
    WHERE routine_activities."routineId"=$1;
    `, [routines.id])

    return activity;

  } catch (error) {
    throw Error(error)
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity

  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [activity] } = await client.query(`
    UPDATE activities
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `, Object.values(fields),);

    return activity;
  } catch (error) {
    throw Error('could not update');
  }

}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
