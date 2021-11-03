const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');

//route for all voters
router.get('/voters', (req, res) => {
    const sql = `SELECT * FROM voters ORDER BY last_name`;
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


//get single voter
router.get('/voter/:id', (req, res) => {
      const sql = `SELECT * FROM voters WHERE id = ?`;
      const params = [req.params.id];

      db.query(sql, params, (err, row) =>{
          if(err){
              res.status(400).json({ error: err.message });
              return;
          }
          res.json({
              message: 'success',
              data: row
          });
      });
  });


//register voter
router.post('/voter', ({ body }, res)=> {
    // Data validation
    const errors = inputCheck(body, 'first_name', 'last_name', 'email');
    if(errors){
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `INSERT INTO voters (first_name, last_name, email) VALUE (?,?,?)`
    const params = [body.first_name, body.last_name, body.email];

    db.query(sql, params, (err, result) => {
        if(err){
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });
});

//update a voters email
router.put('/voter/:id', (req, res) => {
    // Data validation
    const errors = inputCheck(req.body, 'email');
    if(errors){
      res.status(400).json({ error: errors });
    }
    const sql = `UPDATE voters SET email = ? WHERE id = ?`;
    const params = [req.body.email, req.params.id];

    db.query(sql, params, (err, result)=> {
        if(err){
            res.status(400).json({ error: message });
        }else if (!result.affectedRows){
            res.json({
                message: 'Voter not found'
            });
        }else{
            res.json({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        };
    });
});

  //Delete a voter
  router.delete('/voter/:id', (req, res) => {
    const sql = `DELETE FROM voters WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if(err){
            //why error: res.message and not err.message like previous code above?
            res.status(400).json({ error: err.message });
            //if id doesnt exist
        }else if(!result.affectedRows) {
            res.json({
                message: "Voter not found"
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

module.exports = router;
