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
  try{
    const user = await getUserByUserName(username);
    const hashedPassword = user.password;
    const isValid = await bcrypt.compare(password, hashedPassword)

    const { rows } = await client.query(`
    SELECT *
    FROM users
    WHERE username =${user};
    `,[username])
   
    if(isValid){
      delete rows.password
      return rows;
    }else{
      throw Error('Password doesnt verify')
    }


  }catch(error){
    throw Error('Failed getting users')
  }

  

}

async function getUserById(userId) {

}

async function getUserByUsername(userName) {
  try{
    const { rows : [userByUsername]} = await client.query(`
    SELECT * 
    FROM users
    WHERE username =${userName}
    `)
    return userByUsername;
  }catch(error){
    throw Error('Failed to get User')
  }

}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
