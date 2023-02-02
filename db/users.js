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
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;
    const isValid = await bcrypt.compare(password, hashedPassword)

    const { rows: [getUsers]  } = await client.query(`
    SELECT *
    FROM users
    WHERE username =$1 
    `,[username])

    console.log(isValid)
    if(isValid){
      console.log(getUsers)
      delete getUsers.password;
      return getUsers;
    }else{
      return false;
     // throw Error('Password doesnt verify')
    }


  }catch(error){
    throw Error(error)
  }

  

}

async function getUserById(userId) {
  try{
    const { rows: [userById] } = await client.query(`
    SELECT * 
    from users 
    WHERE id=${userId}
    `)
    console.log(userById)
    delete userById.password
    return userById;

  }catch(error){
    throw Error('Failed to get user by Id')
  }

}

async function getUserByUsername(userName) {
  try{
    const { rows: [user]} = await client.query(`
    SELECT * 
    from users 
    WHERE username=$1
    `,[userName])
    console.log(user)
    return user;
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
