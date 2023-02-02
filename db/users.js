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
    throw Error('failed to create user');
  }
}

async function getUser({ username, password }) {
  try{
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT)
     const { rows:[user] } = await client.query(`
     SELECT *
     FROM users;
     ` [username, hashedPassword])

     return user;
  } catch (error) {
    throw Error('Failed to get user')
  }
}

async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
      SELECT id
      FROM users
      WHERE id=${ userId }
    `);

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
      SELECT username
      FROM users
      WHERE username=${ username };
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
