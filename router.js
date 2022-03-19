const router = require('express').Router();
const { body, validationResult } = require('express-validator');

// controllers
const User = require('./controllers/user');

const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            errors: errors.array()
        });
    };
};

// routes
router.route('/')
  .get((req, res) => {
    res.sendFile(__dirname + '/views/index.html')
  });

router.route('/api/users')
  .get(User.findAll)
  .post(User.create);

router.route('/api/users/:_id/logs')
  .get(User.getLogs);

router.route('/api/users/:_id/exercises')
  .post(validate([
      body('description', "Path 'description' is required.").exists(),
      body('duration', "Path 'duration' is required.").exists().isNumeric()
    ]),
   User.createLog);

module.exports = router;