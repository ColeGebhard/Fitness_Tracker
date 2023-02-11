const client = require("./client");
const SALT_COUNT = 10;
const bcrypt = require('bcrypt')
// database functions
// user functions
async function createUser({ username, password }) {
  try{
   const hashedPassword = await bcrypt.hash(password, SALT_COUNT)
   const { rows:[user] } = await client.query(`
    INSERT INTO users(username,password)
    VALUES($1,$2)
    RETURNING *;
    `,[username,hashedPassword]);
    delete user.password;
    return user;
  }catch(error){
    throw Error('failed to create user')}
}

async function getUser({ username, password }) {

  const user = await getUserByUsername(username);
    const hashedPassword = user.password;
  const isValid = await bcrypt.compare(password, hashedPassword);
  try{
     const { rows:[user] } = await client.query(`
     SELECT *
     FROM users
     WHERE username=$1
         AND password=$2;
     `, [username, hashedPassword])
    if (!isValid) {
      return null;
    }
     delete user.password;

     return user;
  } catch (error) {
    return null;
  }
}

async function getUserById(id) {
  try {
    const { rows: [ user ] } = await client.query(`
      SELECT id
      FROM users
      WHERE id=${ id };
    `, );

    if (!user) {
      return null
    }

    return user;
  } catch (error) {
    throw Error('could not get posts');
  }
}
async function getUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [username]);

    return user;
  } catch (error) {
    throw Error('Could not get user');
  }
}


module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
