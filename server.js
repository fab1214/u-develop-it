const mysql = require("mysql2");
const express = require("express");
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    //Your MySQL username
    user: "root",
    //Your MySQL password
    password: "",
    database: "election",
  },
  console.log("Connected to the election database")
);

//Get all candidates
//set api endpoint
app.get("/api/candidates", (req, res) => {
  //database call - run SQL query to select all data from table
  const sql = `SELECT candidates.*, parties.name
               AS party_name
               FROM candidates
               LEFT JOIN parties
               ON candidates.party_id = parties.id`;

  // two variables are used: err - for errors and rows - for the query response
  db.query(sql, (err, rows) => {
    //if theres an error, send 505 message
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    //if ok, send json response of a success message and the data (rows from candidates table)
    res.json({
      message: "Success!",
      data: rows,
    });
  });
});

//Get a single candidate
app.get("/api/candidate/:id", (req, res) => {
  const sql = `SELECT candidates.*, parties.name
               AS party_name
               FROM candidates
               LEFT JOIN parties
               ON candidates.party_id = parties.id
               WHERE candidates.id = ?`;
  //always set params when using ? placeholder
  const params = [req.params.id];

  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success!",
      data: row,
    });
  });
});

//Delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if(err){
            //why error: res.message and not err.message like previous code above?
            res.status(400).json({ error: err.message });
            return;
            //if id doesnt exist
        }else if(!result.affectedRows) {
            res.json({
                message: "Candidate not found"
            });
        } else {
        res.json({
            message: 'deleted',
            changes: result.affectedRows,
            id: req.params.id
        });
      }
    });
});


// Create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
      //error message to be the result of errors (inputCheck function above)
      res.status(400).json({ error: errors });
      return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
                 VALUES (?,?,?)`;
const params = [body.first_name, body.last_name, body.industry_connected];

db.query(sql, params, (err, result) => {
  if (err) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.json({
    message: "success",
    data: body
  });
});
});

//Update a candidate's party
app.put('/api/candidate/:id', (req, res)=> {
  const errors = inputCheck(req.body, 'party_id');

  if(errors){
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `UPDATE candidates SET party_id = ?
               WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];

  db.query(sql, params, (err, result)=> {
    if(err){
      res.status(400).json({ error: err.message });
      //check if a record was found
      }else if (!result.affectedRows){
        res.json({
          message: 'Candidate not found'
        });
      }else {
        res.json({
          message: 'success',
          data: req.body,
          changes: result.affectedRows
        });
      }
  });
});

//route for all parties
app.get('/api/parties', (req, res) => {
  const sql = `SELECT * FROM parties`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

//route for party by id
app.get('/api/party/:id', (req, res) => {
  const sql = `SELECT * FROM parties WHERE id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

//Delete a candidate
app.delete('/api/party/:id', (req, res) => {
  const sql = `DELETE FROM parties WHERE id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      // checks if anything was deleted
    } else if (!result.affectedRows) {
      res.json({
        message: 'Party not found'
      });
    } else {
      res.json({
        message: 'deleted',
        changes: result.affectedRows,
        id: req.params.id
      });
    }
  });
});

//Default response for any other request (Not Found) - MUST BE PLACED LAST
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
