const express = require('express');
const apiRouter = express.Router();

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

// GET /api/health
apiRouter.get('/health', async (req, res, next) => {
    res.send("All is well.");
    next();
});

apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
  
    if (!auth) { // nothing to see here
      next();
    } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);
  
      try {
        const { id } = jwt.verify(token, JWT_SECRET);
  
        if (id) {
          req.user = await getUserById(id);
          next();
        }
      } catch ({ name, message }) {
        next({ name, message });
      }
    } else {
      next({
        name: 'AuthorizationHeaderError',
        message: `Authorization token must start with ${ prefix }`
      });
    }
  });

  apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
    }
  
    next();
  });

// apiRouter: /api/users
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

// apiRouter: /api/activities
const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);

// apiRouter: /api/routines
const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);

// apiRouter: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
apiRouter.use('/routine_activities', routineActivitiesRouter);

module.exports = apiRouter;
