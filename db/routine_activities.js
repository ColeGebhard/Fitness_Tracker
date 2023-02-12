const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try{
    const {rows: [routine_activitiy]} = await client.query(`
    INSERT INTO routine_activities("routineId","activityId",count,duration)
    VALUES($1,$2,$3,$4)
    RETURNING *;
    `,[ routineId,activityId,count,duration])
    return routine_activitiy;

  }catch(error){
    throw Error(error)
  }


}

async function getRoutineActivityById(id) {
  try{
    const {rows: [RoutineById]} = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE id=${id}
    `)
    return RoutineById

  }catch(error){
    throw Error(error)
  }

}

async function getRoutineActivitiesByRoutine({ id }) {
  try{
    const {rows:activitesByRoutine} = await client.query(`
    SELECT * 
    FROM routine_activities
    WHERE "routineId"=${id}
    `)

    return activitesByRoutine

  }catch(error){
    throw Error('failed to get activities by routines',error)
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try{
    const { duration , count } = fields
    let returned

    if(duration){
      const { rows:[updated]} = await client.query(`
      UPDATE routine_activities
      SET duration=$1
      WHERE id=$2
      RETURNING *;
      `,[duration,id])
      returned = updated
    }
    if(count){
      const {rows:[updated]} = await client.query(`
      UPDATE routine_activities
      SET count=$1
      WHERE id=$2
      RETURNING *;
      `,[count,id])
      returned = updated
    }

    return returned

  }catch(error){
    throw Error('Cannot update',error)
  }
}

async function destroyRoutineActivity(id) {
  try{
   const {rows:[deletedRoutine]} = await client.query(`
    DELETE FROM
    routine_activities
    WHERE id=${id}
    RETURNING *;
    `)
    return deletedRoutine
  }catch(error){
    throw Error("Failed to destory",error)
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {

    const { rows: [routineId] } = await client.query(`
      SELECT "routineId" 
      FROM routine_activities 
      WHERE id=${routineActivityId};`, 
      );

    const { rows: [routineCreatorId] } = await client.query(`
      SELECT "creatorId" 
      FROM routines 
      WHERE id=$1;`, 
      [routineId.routineId]);

    if (routineCreatorId.creatorId === userId) {
      return true
    } else {
      return false
    }
  } catch (error) {
    throw new Error('cannot answer if user can edit')
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
