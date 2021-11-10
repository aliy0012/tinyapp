const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(cookieParser());

//user object to store information
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher"
  }
}

//urldatabase
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.use(bodyParser.urlencoded({extended: true}));


//generating random string for short URL
function generatRandomString() {
  let randomString = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 6; i++) {
      randomString += characters.charAt(Math.floor(Math.random()*characters.length));
   }
   return randomString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username : req.cookies['username'], };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    username : req.cookies['username'],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:shortURL', (req, res) => {
  //console.log(req.params);
  const longUrlnew = urlDatabase[req.params.shortURL];
  res.redirect(longUrlnew);

});

app.get('/urls/:shortURL', (req,res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.param.shortURL]
  };
  res.render("urls_show", templateVars);
});

//register page route
app.get('/register', (req, res) => {
  let varTemplate = {username : req.cookies['username']};
  res.render("register", varTemplate);
});

//registering user email and password
app.post('/register', (req, res) => {
  const user_id = generatRandomString();
  console.log(req.body.email);
  users[user_id] = {
    user_id,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users[user_id]);

  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  //console.log(req.body);
  const shortURL = generatRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// URLS/:SHORTURL/DELETE
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

//cookie login
app.post('/login', (req,res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//the Logout Route
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

