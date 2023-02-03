const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  try{
    const { rows: [activity]} = await client.query(`
    INSERT INTO activities(name,description)
    VALUES($1 , $2)
    RETURNING *;
    `,[name,description])
    console.log(activity)
    return activity;

  }catch(error){
    throw Error(error)
  }
  // return the new activity
}

async function getAllActivities() {
  try{
    const {rows: activity } = await client.query(`
    SELECT * 
    FROM activities
    `)
    return activity;

  }catch(error){
    throw Error(error)
  }
  // select and return an array of all activities
}

async function getActivityById(id) {
  try{
    const { rows: [ActivityById] } = await client.query(`
    SELECT * 
    FROM activities 
    WHERE id=$1;
    `,[id])
    console.log(ActivityById)
    return ActivityById;

  }catch(error){
    throw Error(error);
  }
}

async function getActivityByName(name) {
  try{
    const {rows: [activityByName]} = await client.query(`
    SELECT * 
    FROM activities
    WHERE name=$1
    `,[name])
    return activityByName

  }catch(error){
    throw Error(error)
  }
}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
  
  try{
    const {rows: [attachedActivities]} = await client.query(`
    SELECT name,description
    FROM activities
    JOIN routines
 
 
    `)
    console.log('HELLO',attachedActivities)
    return attachedActivities;

  }catch(error){
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
    throw Error(error);
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
