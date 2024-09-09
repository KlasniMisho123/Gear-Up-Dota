import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 5000;
// cross over to client side
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
};

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect();

app.use(cors(corsOptions));
app.use(cors());
app.use(bodyParser.json());

app.post('/gear-up-dota/signup', async(req, res) => {
    const { nickname, email, password } = req.body;
    try {
        console.log('Received sign-up data:', { nickname, email, password });
        await db.query(
            'INSERT INTO gupusers (nickname, email, password) VALUES ($1, $2, $3)',
            [nickname, email, password]
        );
        
        res.status(200).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error('Database Error:', err);  
        res.status(500).json({ message: 'REGISTRATION ERROR' });  
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});