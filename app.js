const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

//Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
  //  host: 'localhost',
  //  user: 'root',
  //  password: '',
  //  database: 'c237_restaurant'

  host: 'db4free.net',
  user: 'c237_user',
  password: 'c237_pass',
  database: 'c237_restaurant'
});
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    return;
    }
        console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// enable static files
app.use(express.static('public'));

// enable form processing
app.use(express.urlencoded ({
    extended: false
}));

// Define routes
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM restaurants';
    // Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving restaurants');
        }
        // Render HTML page with data
        res.render('index', { restaurants: results })
    })
})

app.get('/restaurant/:id', (req, res) => {
    const restaurantId = req.params.id;
    const sql = 'SELECT * FROM restaurants WHERE restaurantId = ?';
    connection.query( sql, [restaurantId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving restaurant by ID');
        }
        if (results.length > 0) { 
            res.render('restaurant', { restaurant: results[0] });
        } else { 
            res.status(404).send('Restaurant not found');
        }
    })
})

app.get('/addRestaurant', (req, res) => {
    res.render('addRestaurant');
});

app.post('/addRestaurant', upload.single('image'), (req, res) => {
    const { name, location } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {
        image - null;
    }

    const sql = 'INSERT INTO restaurants (restaurantName, restaurantLocation) VALUES (?, ?)';
    connection.query( sql, [name, location], (error, results) => {
        if (error) {
            console.error("Error adding restaurant:", error);
            res.status(500).send('Error adding restaurant');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/editRestaurant/:id', (req, res) => {
    const restaurantId = req.params.id;
    const sql = 'SELECT * FROM restaurants WHERE restaurantId = ?';
    connection.query( sql, [restaurantId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('by ID');
        }
        if (results.length > 0) {
            res.render('editRestaurant', {restaurant: results[0] });
        } else {
            res.status(404).send('Restaurant not found');
        }
    })
})

app.post('/editRestaurant/:id', (req, res) => {
    const restaurantId = req.params.id;
    const { name, location } = req.body;

    
    const sql = 'UPDATE restaurants SET name = ?, location = ?, WHERE restaurantId = ?';
    
    connection.query( sql, [name, location, restaurantId], (error, results) => {
        if (error) {
            console.error('Error updating restaurant:', error);
            res.status(500).send('Error updating restaurant');
        } else {
            res.redirect('/');
        }
    })
})

app.get('/deleteRestaurant/:id', (req, res) => {
    const restaurantId = req.params.id;
    const sql = 'DELETE FROM restaurants WHERE restaurantId = ?';
    connection.query(sql, [restaurantId], (error, results) => {
        if (error) {
            console.error("Error deleting restaurant:", error);
            res.status(500).send('Error deleting restaurant');
        } else {
            res.redirect('/');
        }
    }) 
})

// Example:
// app.get('/', (req, res) => {
// connection.query('SELECT * FROM TABLE', (error, results) => {
// if (error) throw error;
// res.render('index', { results }); // Render HTML page with data
// });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));