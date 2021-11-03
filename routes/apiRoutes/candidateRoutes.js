const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');

//Get all candidates
//set api endpoint
router.get("/candidates", (req, res) => {
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
  router.get("/candidate/:id", (req, res) => {
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
  router.delete('/candidate/:id', (req, res) => {
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
  router.post('/candidate', ({ body }, res) => {
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
  router.put('/candidate/:id', (req, res)=> {
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

module.exports = router;