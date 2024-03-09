const express = require('express');
const router = express.Router();
const pool = require('../queries.js');
const bcrypt = require('bcrypt')

var { signToken } = require('../utils/auth.js');
var auth = require('../middleware/authJwt.js');

//-----------------------------------------LOGIN--------------------------------------
router.post('/login', async (req, res) => {
    const { email, password, role, gender } = req.body;

    try {
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
            console.log(password, 'ini bcrypt', user.password)
            return res.status(401).json({ error: 'Incorrect password' });
        }
        const payload = {
            email: email,
            role: role,
            gender: gender
        }
        const token = signToken(payload)
        res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//-------------------------------------POST/REGISTER-----------------------------------
router.post('/register', (req, res) => {
    const { email, password, gender, role } = req.body;

    if (!email || !password || !gender || !role) {
        res.status(400).json({ message: "Bad request" });
        return;
    }

    pool.query('SELECT * FROM users where email = $1', [email], (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Something wrong when checking email' });
            return;
        }
        if (result.rows.length > 0) {
            res.status(400).json({ message: "Email already used. pick another!" });
            return;
        }

        // Mendapatkan ID terakhir dari tabel users
        pool.query('SELECT MAX(id) AS max_id FROM users', (err, result) => {
            if (err) {
                res.status(500).json({ message: 'Something wrong when adding user' });
                return;
            }
            // Menentukan nilai ID baru dan Menambahkan data baru dengan ID baru
            const newId = result.rows[0].max_id + 1;
            //enkripsi password menggunakan bcrypt
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)

            pool.query('INSERT INTO users (id, email, gender, password, role) VALUES ($1, $2, $3, $4, $5)', [newId, email, gender, hash, role], (err, result) => {
                if (err) {
                    console.log('something wrong when adding user', err)
                    res.status(500).json({ message: 'Something wrong when adding user' });
                    return;
                }
                res.status(200).json({ message: "New data added with ID.", newId });
            });

        });
    });
});

//-----------------------------------------------GET---------------------------------
router.get('/users', auth, (req, res) => {
    pool.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.log(`something wrong when get user data`, err);
            res.status(500).json({ message: 'something wrong when get user data' })
        }
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const resultUsers = result.rows.slice(startIndex, endIndex);
        res.json(resultUsers);
    })
})

router.get('/users/:id', auth, (req, res) => {
    const userID = req.params.id;
    pool.query('SELECT * FROM users where id = $1', [userID], (err, result) => {
        if (err) {
            console.log(`something wrong when get user data`, err);
            res.status(500).json({ message: 'something wrong when get user data' })
        }
        res.json(result.rows);
    })
})

//----------------------------------------PUT------------------------------------------
router.put('/users/:id', auth, (req, res) => {
    const userID = req.params.id;
    const { email, password, gender, role } = req.body;

    if (!email || !gender || !password || !role) {
        res.status(400).json({ message: 'Please fill all properties' });
        return;
    }

    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    pool.query('UPDATE users SET email = $1, gender = $2, password = $3, role = $4 WHERE id = $5', [email, gender, hash, role, userID], (err, result) => {
        if (err) {
            console.error('Something wrong when updating user:', err);
            res.status(500).json({ message: 'Something wrong when updating user' });
            return;
        }

        if (result.rowCount === 0) {
            res.status(404).json({ message: `User with ID ${userID} not found` });
            return;
        }

        res.status(200).json({ message: `User with ID ${userID} updated!` });
    });
});

//---------------------------------DELETE----------------------------------------------
router.delete('/users/:id', auth, (req, res) => {
    const userID = req.params.id;

    pool.query('DELETE FROM users WHERE id = $1', [userID], (err, result) => {
        if (err) {
            console.error('something wrong when deleting user:', err);
            res.status(500).json({ message: 'something wrong when deleting user' });
            return;
        }

        if (result.rowCount === 0) {
            res.status(404).json({ message: `Users with ID ${userID} not found.` });
            return;
        }

        res.status(200).json({ message: `Users with ID ${userID} deleted!` });
    });
});

module.exports = router;