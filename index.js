const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// importing models
const User = require(__dirname + '/models/User.js');
const Exercise = require(__dirname + '/models/Exercise.js');

// configuring parser
app.use(bodyParser.urlencoded({ extended: false }));

// Other configurations
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Connecting to the database.
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to the db.');
  })
  .catch((err) => {
    console.log(err);
  });

// POST Request that creates user if 
app.post('/api/users', async (req, res) => {
  try{
    const username = req.body.username;
    const data = await User.findOne({ username: username });

    if(data){
      return res.status(409).json({ error: 'User already exists.'});
    }

    const user = new User({
      username: username
    });

    const result = await user.save();

    res.status(201).json({
      _id: result._id,
      username: result.username
    });
  } catch(err) {
    res.status(500).json({ error: err });
  }
});

// GET Request that returns all users in the db
app.get('/api/users', async (req, res) => {
  try {
    const data = await User.find();

    res.status(200).json(data);
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    // Finding user by id
    const data = await User.findById(req.params._id);
    console.log(data);
    if(!data){
      return res.status(404).json({ error: 'There is no such user.' });
    }

    const exercise = new Exercise({
      _id: req.params._id,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date).toString() : new Date().toString()
    });

    const result = await exercise.save();

    res.status(201).json({
      _id: data._id,
      username: data.username,
      date: result.date,
      duration: result.duration,
      description: result.description
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get('/api/users/:_id/logs', async (req, res) => {
//   try {
//     const userId = req.params._id;
    
//     const data = await Exercise.find({ _id: userId });
//     if(data){
//       return res.status(200).json({
//         _id: userId
//         // CONTINUE THIS
//       });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err });
//   }
// });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
