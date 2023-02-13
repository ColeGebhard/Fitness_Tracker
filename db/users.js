const client = require('./client');
const SALT_COUNT = 10;
const bcrypt = require('bcrypt')

// database functions
// user functions
async function createUser({ username, password }) {
  
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

  //eslint-disable-next-line no-useless-catch
  try{

   const { rows: [user] } = await client.query(`
    INSERT INTO users(username,password)
    VALUES($1,$2)
    ON CONFLICT (username) DO NOTHING
    RETURNING id, username;
    `,[username,hashedPassword]);
    // delete user.password;
    return user;

  }catch(error){
    throw error;
  }
}

async function getUserByUsername(userName) {
  // first get the user
    //eslint-disable-next-line no-useless-catch
  try {
    const {rows} = await client.query(`
      SELECT *
      FROM users
      WHERE username = $1;
    `, [userName]);
    // if it doesn't exist, return null
    if (!rows || !rows.length) return null;
    // if it does:
    // delete the 'password' key from the returned object
    const [user] = rows;
    // delete user.password;
    return user;
  } catch (error) {
    console.error(error)
  }
}


async function getUser({ username, password }) {
  if (!username || !password){
    return;
  }

  //eslint-disable-next-line no-useless-catch
  try{

    const user = await getUserByUsername(username);

    if(!user) return;

    const hashedPassword = user.password;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if(!passwordMatch) return;

    delete user.password;

    return user;

  }catch (error){
    throw error;
  }

}

async function getUserById(userId) {

  //eslint-disable-next-line no-useless-catch
  try {
    const { rows: [user] } = await client.query(`
      SELECT * FROM users
      WHERE id = $1;
      `,[userId]);

    if (!user) return null;
    delete user.password;
    
    return user;

  } catch (error) {
    throw error;
  }

}


module.exports = {
  createUser,
  getUserByUsername,
  getUser,
  getUserById
}
