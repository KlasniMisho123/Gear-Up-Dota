import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from 'dotenv';
import axios from "axios";
import * as cheerio from 'cheerio';

const app = express();
const port = 5000;
// cross over to client side
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
};

dotenv.config();

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

// async function scrapeSastEvents() {
//     try {

//         const pastEventResults = await axios.get('https://www.gosugamers.net/dota2/tournaments?state=4')
        
//         const html = pastEventResults.data;

//         const $ = cheerio.load(html);

//         const targetPastEvents = $('.MuiStack-root mui-cncq3f');
//         // const targetPastEvents = $('.MuiTypography-root MuiTypography-body1 mui-1p8cs6u');

//         console.log("SMASH")
//         // targetPastEvents.each((index, element) => {
//         //     console.log($(element));
//         // });

//     } catch(err) {
//         console.log(`Cought Duting Scrapeing Web ${err}`)
//     }
// }


app.get("/", async (req, res) => {
    try {
        // count total users
        const usersResult = await db.query("SELECT COUNT(*) FROM public.gupusers");
        const userCount = usersResult.rows[0].count;
        res.send(`${userCount}`);

        // parse recent events 
        // scrapeSastEvents();

        


    } catch (err) {
        console.log("Connection error: ", err);
        res.status(500).send("Error loading user count");
    }
});

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
        if (err.code === '23505') { // Duplicate email handle
            console.error('Registration Error: Duplicate email');
            res.status(400).json({
                message: 'Email already exists. Please use a different email.',
                errorType: "Duplicate email"
            });
        } else {
            console.error('Database Error:', err);
            res.status(500).json({ message: 'REGISTRATION ERROR' });
        }
    }    
});

app.post("/gear-up-dota/login", async (req, res) => {
    const { loginEmail, loginPassword } = req.body;

    function verifyUser(email, password) {
        const queryWithEmail = "SELECT * FROM gupusers WHERE email = $1 AND password = $2";
        db.query(queryWithEmail, [email, password], (err, result) => {
            if (err) {
                console.error("Error querying the database:", err);
                return;
            }
            if (result.rows.length > 0) {
                console.log("Result: ", result.rows);
                res.status(200).json({
                    message: "Succesfully Loged in"
                    
                });

            } else {
                console.log("Wrong Email or Password.");
                res.status(400).json({
                    message: "Wrong Email or Password.",
                    errorType: "Invalid user"
                });
            }
        });
    }

    try {
        console.log(`EMAIL: ${loginEmail}, PASSWORD: ${loginPassword}`);
        verifyUser(loginEmail, loginPassword);
        
    } catch (err) {
        console.log("Retrieve Error:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post("/gear-up-dota/feedback", async (req, res) => {
    const response  = req.body;

    let feedbackUser = response.data.FeedbackUser;
    let feedbackEmail = response.data.FeedbackEmail;
    let feedbackType = response.data.FeedbackType;
    let feedbackIssue = response.data.FeedbackIssue;
    let feedbackText = response.data.FeedbackText;

    try {
        if(feedbackText.length > 0 ) {
            await db.query("INSERT INTO gupfeedbacks (name, email, subject, issue_type, feedback) VALUES($1, $2, $3, $4, $5)",
                [feedbackUser, feedbackEmail, feedbackType, feedbackIssue, feedbackText])
            console.log("Feedback Added To Database")
            
        } else {
            console.log("feedbackText is Required")
        }

    } catch(err) {
        console.log('cant connect: ',err)
    }
    
    
    // if(feedbackUser.length = 0) {
    //     feedbackUser = "Unknown User"
    // }

    
})


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});