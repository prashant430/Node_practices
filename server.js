const express = require('express');
const users = require('./MOCK_DATA.json');
const path = require('path');
const app = express();
const cors = require('cors');
const port = 8000;
const fs = require('fs');
const pool = require('./db');


// Enable CORS
app.use(cors());

// middleware plugin

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the React app's build folder
app.use(express.static(path.join(__dirname, '/node_modules/src/build')));

// Catch-all handler to return React's index.html for unknown routes
app.get(' ', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/src/build', 'index.html'));
});


app.get('/',(req,res) => {
 return res.send('Hello From Homepage');
});

app.get('/about', (req,res) => {
return res.send(`Hello From About us page Hey ${req.query.name}  you are ${req.query.age}`);
});

app.get('/users',(req,res) =>{
const html = `
<ul>
${users.map(user => `<li>${user.first_name}</li>`).join("")}
</ul>
`;
res.send(html);
});

app.get('/api/users',(req,res) =>{
    res.json(users);
});

app.get('/api/users/:id',(req,res) =>{
  const id = Number(req.params.id);
  const user = users.find(x => x.id == id);
  return res.json(user);
});



app.patch('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  const userIndex = users.findIndex(user => user.id === id);
  users[userIndex] = { ...users[userIndex], ...body };
  fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err,data) => {
    res.json({ status: "Successfully Updated", updatedUser: users[userIndex] });
  });
});


app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  const userIndex = users.findIndex(user => user.id === id);
  const deletedUser  = users.splice(userIndex , 1)[0];
  fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err,data) => {
    res.json({ status: "User successfully deleted", deletedUser  });
  });
});

app.get('/test-connection', (req, res) => {
  pool.query('SELECT NOW()', (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Database connection error');
    }
    res.send(`Database connected at: ${results[0]['NOW()']}`);
  });
});

app.post('/api/users',(req,res) =>{
    const body = req.body;
    users.push({...body , id: users.length + 1 });
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err,data) => {
      return res.json({status: "Successfully Saved"});
    })
    
});



app.post('/db-user', (req, res) => {
  const { name, email } = req.body;  // Extract name and email from the request body

  // Validate input
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Insert the user into the MySQL database
  pool.query(
    'INSERT INTO users (name, email) VALUES (?, ?)', 
    [name, email],  // Use the values from the request body
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Failed to create user');
      }

      // Respond with the user details including the inserted ID
      res.status(201).json({
        id: results.insertId,
        name,
        email
      });
    }
  );
});


app.get('/db-users', (req, res) => {
  pool.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Failed to retrieve users');
    }
    res.json(results);
  });
});


// app.listen(port ,() => console.log(`You server is running on ${port} port`));
app.listen(port,function(){
console.log(`You server is running on ${port} port`)   
})  



