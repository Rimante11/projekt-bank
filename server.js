import express from "express";
import session from "express-session";
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const port = 3000;
const app = express();
const saltRounds = 10;

const client = new MongoClient('mongodb://127.0.0.1:27017'); //mongodb länken
await client.connect();
const db = client.db('bankprojekt'); //från mongo 'bankprojekt'
const usersCollection = db.collection('users'); //från mongo 'users'

app.use(express.static('public')); //public min egen mappen i vsc
app.use(express.json());

app.use(session({
  resave: false, //sparar inte session om unmodified
  saveUninitialized: false, //skapar inte session innan nånting stored
  secret: 'this is a secret',
  cookie: {
    maxAge: 5 * 60 * 1000 // total 5min
  }
}));


/*--Login--*/
app.post('/api/users/login', async (req, res) => {
  const user = await usersCollection.findOne({ user: req.body.user});
  const passMatches = await bcrypt.compare(req.body.password, user.password)
  console.log(user);

  if (user && passMatches) {
    console.log('Gets here'); //radera sen
    req.session.user = user;

    res.json({
      user: user
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

//check loggin
app.get('/api/users/loggedin', async (req, res) => {
  if(req.session.user) {
    res.json({
      _id: req.session._id,
      user: req.session.user,
      total: req.session.total
    });
  }else{
    res.status(401).json({ error: 'Unauthorized' });
  }
});


/*--Logout--*/
app.post('/api/users/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({
      loggedin: false
    });
  });
});

//update users account
app.put('/api/users/update/:id', async (req, res) => {
  let users = await usersCollection.findOne({ _id: ObjectId(req.params.id) });
  users = {
    ...users,
    ...req.body
  };
  await usersCollection.updateOne({ _id: ObjectId(req.params.id)}, { $set: users});
  //behövdes för att updatera total withdraw
  req.session.user = {
    ...req.session.user,
    total: req.body.total
  }

  res.json({
    sucess: true,
    users
  });
});

//get user
app.get('/api/users/:id', async (req, res) => {
  const users = await usersCollection.findOne({ _id: ObjectId(req.params.id) });
  res.json(users);
});

//register user
app.post('/api/users/create', async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, saltRounds);
  const users = {
    user: req.body.user,
    password: hash,
    total: req.body.total
  };

  await usersCollection.insertOne(users);

  res.json({
    sucess: true,
    users
  }) 
});

//delete users account 
app.delete('/api/users/delete/:id', async (req, res) => {
  await usersCollection.deleteOne({ _id: ObjectId(req.params.id) });
  res.status(204).send();
  req.session.destroy();
});


app.listen(port, () => console.log(`Listening on port ${port}`));