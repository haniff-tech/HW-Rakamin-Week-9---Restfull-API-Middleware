const express = require('express');
const router = express.Router();
const pool = require('../queries.js');
const bcrypt = require('bcrypt')

var { signToken } = require('../utils/auth.js');
var auth = require('../middleware/authJwt.js');


//-----------------------------------------GET-------------------------------------
router.get('/movies', auth, (req, res) => {
    pool.query(
        `SELECT * FROM movies `,
        (error, results) => {
            if (error) {
                throw error;
            }
            const page = parseInt(req.query.page)
            const limit = parseInt(req.query.limit)

            const startIndex = (page - 1) * limit
            const endIndex = page * limit
           
            const resultMovies = results.rows.slice(startIndex, endIndex);
            res.json(resultMovies);
        }
    );
});

//-------------------------------------POST----------------------------------------
router.post('/movies/add', auth, (req, res) => {
    const { title, genres, year } = req.body;

    if (!title || !genres || !year) {
        res.status(400).json({ message: 'Please fill all properties' });
        return;
    }

    pool.query('SELECT * FROM movies', (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Something wrong when adding movie' });
            return;
        }

        pool.query('SELECT MAX(id) AS max_id FROM movies', (err, result) => {
            if (err) {
                res.status(501).json({ message: 'Something wrong when adding movie' });
                return;
            }
            const newId = result.rows[0].max_id + 1;
            pool.query('INSERT INTO movies (id, title, genres, year) VALUES ($1, $2, $3, $4)', [newId, title, genres, year], (err, result) => {
                if (err) {
                    console.log('something wrong when adding user', err)
                    res.status(502).json({ message: 'Something wrong when adding movie' });
                    return;
                }
                res.status(200).json({ message: "New Movie data added with ID.", newId });
            });
        });
    });
});

//------------------------------------------PUT------------------------------------
router.put('/movies/:id', auth, (req, res) => {
    const userID = req.params.id;
    const { title, genres, year } = req.body;

    if (!title || !genres || !year) {
        res.status(400).json({ message: 'Please fill all properties' });
        return;
    }

    pool.query('UPDATE movies SET title = $1, genres = $2, year = $3 WHERE id = $4', [title, genres, year, userID], (err, result) => {
        if (err) {
            console.error('Something wrong when updating Movie:', err);
            res.status(500).json({ message: 'Something wrong when updating Movie' });
            return;
        }

        if (result.rowCount === 0) {
            res.status(404).json({ message: `Movie with ID ${userID} not found` });
            return;
        }

        res.status(200).json({ message: `Movie with ID ${userID} updated!` });
    });
});

//---------------------------------------DELETE------------------------------------
router.delete('/movies/:id', auth, (req, res) => {
    const userID = req.params.id;

    pool.query('DELETE FROM movies WHERE id = $1', [userID], (err, result) => {
        if (err) {
            console.error('something wrong when deleting movie:', err);
            res.status(500).json({ message: 'something wrong when deleting movie' });
            return;
        }

        if (result.rowCount === 0) {
            res.status(404).json({ message: `Movie list with ID ${userID} not found.` });
            return;
        }

        res.status(200).json({ message: `Movie list with ID ${userID} deleted!` });
    });
});

module.exports = router