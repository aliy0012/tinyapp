const getUserByEmail = require("./helper");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs'); //bcrypt added

const cookieSession = require('cookie-session');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['123343434434344', 'elementdncddceckekhyfty']
}))

//user object to store information
const users = {};

//urldatabase
const urlDatabase = {};


//generating random string for short URL
function generatRandomString() {
  let randomString = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomString;
}



function userURLs(id) {
  let userURLS = {};
  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      userURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLS;
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//url index page
app.get("/urls", (req, res) => {
  const userId = req.session['user_id'];
  const userUrls = userURLs(userId);
  let templateVars = { urls: userUrls, user: users[userId] };
  res.render('urls_index', templateVars);
});

// urls with user id
app.post("/urls", (req, res) => {
  const shortURL = generatRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

// create new short url with login check
app.get("/urls/new", (req, res) => {
  if(req.session.user_id) {
    let templateVars = { user: users[req.session.user_id] };
    return res.render("urls_new", templateVars);
  } 
  return res.redirect('/login');
});

//user specific urls showed
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: userURLs(req.session.user_id).longURL,
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longUrlnew = urlDatabase[req.params.shortURL];
  res.redirect(longUrlnew);
});


//register page route
app.get("/register", (req, res) => {
  let varTemplate = { user: users[req.session.user_id] };
  res.render("register", varTemplate);
});

//registering user email and password
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (undefined !== getUserByEmail(req.body.email, users)) {
      res.statusCode = 400;
      return res.send("Email exists. Please Login.");
    }
    const userId = generatRandomString();
    users[userId] = {
      user_id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    //res.cookie("user_id", userId);
    req.session.user_id = userId;
    return res.redirect("/urls");
  }
  res.statusCode = 400;
  return res.send("<h4>Error code : 400. Email or Password field is empty!</h4>");
});



// only can delete own urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }

  return res.redirect('/urls');
});

//only can edit own urls
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// login page
app.get("/login", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render('login', templateVars);
});

//adding login functionality
app.post("/login", (req, res) => {

  const userL = getUserByEmail(req.body.email, users);
  
  if (userL === undefined) {
    res.status = 403;
    return res.send("Not registered as user. Please Register");
  } else {
    if (!bcrypt.compareSync(userL.password, req.body.password)) {
      res.status = 403;
      return res.send("Password and email not matching!");
    } 
    req.session.user_id = userL.userId;
    res.redirect('urls');
  }  
});

//the Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
