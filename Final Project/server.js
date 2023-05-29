const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: '127.0.0.1',
  database: 'practice',
  user: 'root',
  password: 'jmc12345'
});

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
  })
);

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    // User is logged in, proceed to the next
    next();
  } else {
    // User is not logged in, redirect to the login page
    res.redirect('/home');
  }
};

app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/registration', (req, res) => {
  res.sendFile(__dirname + '/registration.html');
});

app.get('/api.html', requireLogin, (req, res) => {
  res.sendFile(__dirname + '/api.html');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (error, results) => {
    if (error) {
      console.error('Error logging in: ', error);
      res.status(500).send('Error logging in');
    } else {
      if (results.length > 0) {
        console.log('Login successful');
        req.session.isLoggedIn = true; // Set isLoggedIn flag in session
        req.session.userID = results[0].userID; // Set the userID in the session
        res.redirect('/api.html'); // Redirect to api.html upon successful login
      } else {
        console.log('Invalid credentials');

        // Send the login.html content with an error message
        const loginPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>User Login</title>
          <style>
            body {
              margin: 0;
              padding: 0;
            }

            .container {
              display: flex;
              justify-content: center; /* Center the container horizontally */
              align-items: center; /* Center the container vertically */
              height: 100vh;
            }

            .middle {
              flex-grow: 1;
              background-color: rgba(4, 138, 114, 1);
              height: 100vh;
            }

            .left,
            .right {
              width: 10%;
              background-color: rgba(4, 138, 114, 0.7);
              height: 100vh;
            }

            h1 {
              text-align: center;
              color: rgb(0, 0, 0);
              padding: 10px;
            }

            #login {
              width: 400px;
              margin: auto;
              margin-top: 60px;
              padding: 30px;
              background-color: white;
              border-radius: 10px;
              box-shadow: 0 2px 5px rgba(6, 91, 74, 0.7); /* Add a subtle box-shadow */
            }

            #submitButton {
              text-align: center;
            }

            input[type="text"],
            input[type="password"] {
              width: 350px;
              padding: 13px;
              border: 1px solid #048A72;
              border-radius: 10px;
              margin-bottom: 10px;
              margin-left: 10px;
            }

            input[type="submit"] {
              width: 50%;
              padding: 13px;
              border: 1px solid #048A72;
              background-color: rgba(55, 243, 209, 0.5);
              border-radius: 10px;
              margin-bottom: 10px;
              margin-left: auto;
              margin-right: auto;
            }

            p {
              text-align: center;
              color: black;
              margin-top: 20px;
            }

            a {
              color: #048A72;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="left"></div>
            <div class="middle">
              <div id="login">
                <h1>User Login</h1>
                <p>Your Detector.Ai account lets you utilize the tools easily.</p>
                <form action="/login" method="post" onsubmit="redirectToApi()">
                  <input type="text" name="username" id="username" placeholder="Username" required><br><br>
                  <input type="password" name="password" id="password" placeholder="Password" required><br><br>
                  <div id="submitButton">
                    <input type="submit" value="Login">
                    <p id="errorMessage" style="color: red;">Username or Password Incorrect</p>
                    <p>Don't have an account? <a href="/registration">Register</a></p>
                    <script>
                      function redirectToApi() {
                        window.location.href = '/api-page.html';
                      }
                    </script>
                  </div>
                </form>
              </div>
            </div>
            <div class="right"></div>
          </div>
        </body>
        </html>
        `;
        res.send(loginPage);
      }
    }
  });
});

app.post('/registration', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if the username is already taken
  connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error('Error checking username availability:', error);
      res.status(500).send('Error checking username availability');
    } else {
      if (results.length > 0) {
        // Username is already taken
        console.log('Username already exists');
        
        // Send the login.html content with an error message
        const registerPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>User Registration</title>
          <style>
            body {
              margin: 0;
              padding: 0;
            }

            .container {
              display: flex;
              justify-content: center; /* Center the container horizontally */
              align-items: center; /* Center the container vertically */
              height: 100vh;
            }

            .middle {
              flex-grow: 1;
              background-color: rgba(4, 138, 114, 1);
              height: 100vh;
            }

            .left,
            .right {
              width: 10%;
              background-color: rgba(4, 138, 114, 0.7);
              height: 100vh;
            }

            h1 {
              text-align: center;
              color: rgb(0, 0, 0);
              padding: 10px;
            }

            #register {
            width: 400px;
            margin: auto;
            margin-top: 60px;
            padding: 30px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgb(6, 91, 74); /* Add a subtle box-shadow */
            }


            #submitButton {
              text-align: center;
            }

            input[type="text"],
            input[type="password"] {
              width: 350px;
              padding: 13px;
              border: 1px solid #048A72;
              border-radius: 10px;
              margin-bottom: 10px;
              margin-left: 10px;
            }

            input[type="submit"] {
              width: 50%;
              padding: 13px;
              border: 1px solid #048A72;
              background-color: rgba(55, 243, 209, 0.5);
              border-radius: 10px;
              margin-bottom: 10px;
              margin-left: auto;
              margin-right: auto;
            }

            p {
              text-align: center;
              color: black;
              margin-top: 20px;
            }

            a {
              color: #048A72;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="left"></div>
            <div class="middle">
              <div id="register">
                <h1>User Registration</h1>
                <p>Your Detector.Ai account lets you utilize the tools easily.</p>
                <form action="/registration" method="post">
                  <input type="text" name="username" id="username" placeholder="Username" required><br><br>
                  <input type="password" name="password" id="password" placeholder="Password" required><br><br>
                  <div id="submitButton">
                    <input type="submit" value="Register">
                    <p id="errorMessage" style="color: red;">Username already taken</p>
                    <p>Already have an account? <a href="/login">Log in</a></p>
                  </div>
                </form>
              </div>
            </div>
            <div class="right"></div>
          </div>
        </body>
        </html>    
        `;
        res.send(registerPage);

      } else {
        // Username is available, proceed with registration
        connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (error, results) => {
          if (error) {
            console.error('Error registering user:', error);
            res.status(500).send('Error registering user');
          } else {
            console.log('Registration successful');
            const userID = results.insertId; // Get the inserted userID
            req.session.userID = userID;
            req.session.isLoggedIn = true; // Set isLoggedIn flag in session
            res.redirect('/api.html');// Send success message instead of redirecting
          }
        });
      }
    }
  });
});


app.post('/api', requireLogin, async (req, res) => {
  try {
    const inputText = req.body.inputText;
    const userID = req.session.userID; // Retrieve the user's ID from the session
    const organizationId = '539825'; // Replace with your actual organization ID

    const url = `https://enterprise-api.writer.com/content/organization/${organizationId}/detect`;
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: 'Yb1is4-3JGLr9Yr-a9x5cOCwkBL_WTi56QcYo_44z9cbbYN0ZXSmT_j3xpHNnxZtszdNDeVnWnO6V-zQoo2b1R9o9BSCJ5P1ahJJtNDoZOIk2ovvOijpPMIBUUgYJMMd',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        input: inputText
      })
    };

    const response = await fetch(url, options);
    const result = await response.json();

    const realPercentage = Math.round(result.find(item => item.label === 'real').score * 100);
    const fakePercentage = Math.round(result.find(item => item.label === 'fake').score * 100);

    // Save the input text to the MySQL table
    connection.query('INSERT INTO inputs (userID, text) VALUES (?, ?)', [userID, inputText], (error, results) => {
      if (error) {
        console.error('Error saving input:', error);
        res.send(`
          <h1>API Page</h1>
          <form action="/api" method="POST">
            <label for="inputText">Input text (Limit of 1,500 characters at a time):</label>
            <textarea id="inputText" name="inputText" rows="4" cols="50" required>${inputText}</textarea><br><br>
            <input type="submit" value="Submit">
          </form>
          <h2>Error:</h2>
          <pre>Error saving input: ${error}</pre>
        `);
      } else {
        console.log('Input saved successfully');

        // Render the results on the api.html page
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Detector.AI</title>
          <style>
            /* CSS styles for the template */
            body {
              font-family: 'Hubballi';
              font-style: normal;
              font-weight: 400;
              /*text-align: center;*/
              margin: 0;
              padding: 0;
            }
            
            .container {
              display: flex;
              justify-content: center; /* Center the container horizontally */
              align-items: center; /* Center the container vertically */
              height: 100vh;
            }

            .middle {
              flex-grow: 1;
              background-color: rgba(4, 138, 114, 1);
              height: 100vh;
            }

            .left,
            .right {
              width: 10%;
              background-color: rgba(4, 138, 114, 0.7);
              height: 100vh;
            }

            h1{
              font-size: 50px;
            }
            
            h4 {
              font-size: 20px;
            }
            
            
            h1, p {
              color: #FFFFFF;
              text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            }

            #API{
              margin-top: 50px;
              margin-left: 20px;
            }

            #inputText {
            min-width: 600px; /* Adjust the minimum width as per your requirements */
            min-height: 300px; /* Adjust the minimum height as per your requirements */
            resize: none; /* Prevent manual resizing */

            }

            .output{
              margin-right: 40px;
              font-size: 20px;
              
            }

            .api-container{
              display: flex;
              flex-direction: row;
            }

            .textarea {
              flex: 1;
            }

            .logout-btn {
              text-align: center;
              margin-top: 10px;
            }
            
            input[type="submit"] {
            appearance: none;
            background-color: transparent;
            border: 1px solid #1A1A1A;
            border-radius: 0.9375em;
            box-sizing: border-box;
            color: #3B3B3B;
            cursor: pointer;
            display: inline-block;
            font-family: Roobert,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
            font-size: 10px;
            font-weight: 600;
            line-height: normal;
            min-height: 10px;
            min-width: 0;
            outline: none;
            padding: 10px 10px;
            text-align: center;
            text-decoration: none;
            transition: all 300ms cubic-bezier(.23, 1, 0.32, 1);
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
            will-change: transform;
            }
        
            input[type="submit"]:disabled {
            pointer-events: none;
            }
        
            input[type="submit"]:hover {
            color: #fff;
            background-color: #1A1A1A;
            box-shadow: rgba(0, 0, 0, 0.25) 0 8px 15px;
            transform: translateY(-2px);
            }
        
            input[type="submit"]:active {
            box-shadow: none;
            transform: translateY(0);
            }
      
          </style>
        </head>
        <body>
          <div class="container">
            <div class="left"></div>
            <div class="middle">
              <div id="API">
                <h1>Detector.AI</h1>
                <h4>Input text (Limit of 1,500 characters at a time):</h4>
                
                <div class="api-container">

                  <div class="textarea">
                    <form action="/api" method="POST">
                      <textarea id="inputText" name="inputText" rows="4" cols="50" required></textarea>
                      <br>
                      <input type="submit" value="Submit">
                    </form>
                  </div>
                  
                  <div class="output">
                    <pre>Human Generated Content: ${realPercentage}%<br><br>AI Generated Content: ${fakePercentage}%</pre>
                  </div>

                </div>
              </div>
            </div>
            <div class="right">
              <div class="logout-btn">
                <form action="/logout" method="GET">
                  <input type="submit" value="Logout">
                </form>
              </div>
            </div>
          </div>
        </body>
        </html>

        
        `);
      }
    });
  } catch (error) {
    console.error('Error calling the API:', error);
    res.send(`
      <h1>Detector.AI</h1>
      <form action="/api" method="POST">
        <label for="inputText">Input text (Limit of 1,500 characters at a time):</label>
        <textarea id="inputText" name="inputText" rows="4" cols="50" required>${inputText}</textarea><br><br>
        <input type="submit" value="Submit">
      </form>
      <h2>Error:</h2>
      <pre>Error calling the API: ${error}</pre>
      <form action="/logout" method="GET">
      <input type="submit" value="Logout">
      </form>
    `);
  }
});



app.get('/logout', requireLogin, (req, res) => {
  // Clear the session and redirect to the login page
  req.session.destroy(err => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).send('Error logging out');
    } else {
      console.log('Logout successful');
      res.redirect('/home');
    }
  });
});


app.post('/save-input', requireLogin, (req, res) => {
  const inputText = req.body.inputText;

  connection.query('INSERT INTO inputs (text) VALUES (?)', [inputText], (error, results) => {
    if (error) {
      console.error('Error saving input:', error);
      res.status(500).send('Error saving input');
    } else {
      console.log('Input saved successfully');
      res.redirect('/api.html');
    }
  });
});


const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});
