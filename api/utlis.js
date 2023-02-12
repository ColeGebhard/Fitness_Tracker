function requireUser(req, res, next) {
    if (!req.headers.authorization) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action"
        });
    }

    next();
}

module.exports = {
    requireUser
}