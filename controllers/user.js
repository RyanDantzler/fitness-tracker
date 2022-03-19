const mongoose = require('mongoose');
const UserModel = require('../models/user');

const userIdExists = async (id) => {
  return new Promise((resolve, reject) => {
    UserModel.find({ "_id": id }, { "_id": 1 }, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      if (data) {
        resolve(true);
      }
      else
        reject(false);
    });
  });
};

exports.findAll = (req, res) => {
  UserModel.find()
    .select({"_id": 1, username: 1 })
    .exec((err, data) => {
      if (err) return console.log(err);
    
      res.json(data);
  });
};

exports.create = (req, res) => {
  UserModel.exists({ username: req.body.username }, (err, data) => {
    if (err) return console.log(err);

    if (data) {
        UserModel.findById({ "_id": data._id }, (err, data) => {
          if (err) return console.log(err);

          res.json({ username: data.username, "_id": data._id });
      });
    } else {
      UserModel.create({ username: req.body.username }, (err, data) => {
        if (err) return console.log(err);

        res.json({ username: data.username, "_id": data._id });
      });
    }
  });
};

exports.getLogs = async (req, res) => {
  let from = new Date(req.query.from);
  let to = req.query.to ? new Date(req.query.to) : new Date();
  let limit = req.query.limit ? req.query.limit : null;
  
  try {
    if (await userIdExists(req.params._id)) {
      UserModel.aggregate([
        { $match: { "_id": mongoose.Types.ObjectId(req.params._id) } },
        { $project: {
            username: "$username",
            log: {
              $filter: {
                input: "$log",
                as: "log",
                cond: { $and: [
                  { $gte: [ "$$log.date", from ] },
                  { $lte: [ "$$log.date", to ] }
                  ]
                }
              }
            }
          }
        }
      ], (err, data) => {
        if (err) console.log(err);
  
        if (limit == null || limit > data[0].log.length)
          limit = data[0].log.length;
  
        res.json({ 
            "_id": data[0]._id, 
            username: data[0].username,
            count: +limit, 
            log: data[0].log
              .sort((a, b) => { return a.date < b.date ? 1 : a.date == b.date ? 0 : -1 })
              .slice(0, limit)
              .map((item) => ({
                description: item.description,
                duration: item.duration,
                date: item.date.toDateString()
            }))
        });
      });
    } else {
      res.status(404).end('Not found');
    }
  } catch (err) {
    console.error(err);
    res.json({ error: err });
  }
};

exports.createLog = async (req, res) => {
  let date = req.body.date ? new Date(req.body.date) : new Date();
  let workout = { description: req.body.description, duration: +req.body.duration, date: date };

  if (await userIdExists(req.params._id)) {
    UserModel.findByIdAndUpdate(
      { "_id": req.params._id }, 
      { $push: { log: workout }},
      (err, data) => {
      if (err) return console.log(err);

      res.json({ "_id": data._id, username: data.username, date: workout.date.toDateString(), duration: workout.duration, description: workout.description });
    });
  } else {
    res.status(404).end('Not found');
  }
};