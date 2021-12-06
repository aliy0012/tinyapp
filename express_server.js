const {getUserByEmail, generatRandomString, userURLs, currentUser} = require("./helpers/helpers");
const {urlDatabase, users} = require("./helpers/database");


const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs"); //bcrypt added

const cookieSession = require("cookie-session");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["1233434344"],
  })
);



app.get("/", (req, res) => {
  if (req.session.userID) {
    res.render(`/urls`);
  } else {
    res.redirect('/login');
  }
});


//url index page
app.get("/urls", (req, res) => {
  if (currentUser(req.session.userID, users)) {
    const userID = req.session.userID;
    const userUrls = userURLs(userID, urlDatabase);
    const templateVars = {
      urls: userUrls,
      user: users[userID]
      };
    res.render('urls_index', templateVars);
  } else {
    res.redirect("login");
  }
});

// urls with user id
app.post("/urls", (req, res) => {
  if (currentUser(req.session.userID, users)) {
    const shortURL = generatRandomString();
    urlDatabase[shortURL] = {
      userID: req.session.userID,
      longURL: req.body.longURL
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send('Please log in to proceed');
  }
});

// create new short url with login check
app.get("/urls/new", (req, res) => {
  if (req.session.userID) {
    let templateVars = { user: users[req.session.userID] };
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

//user specific urls showed
app.get("/urls/:shortURL", (req, res) => {
  if (currentUser(req.session.userID, users)){
  const userUrls = userURLs(req.session.userID, urlDatabase);
  const shortURL = req.params.shortURL;
  let templateVars = {
    user: users[req.session.userID],
    shortURL: shortURL,
    longURL: userUrls[shortURL].longURL
  };
  res.render("urls_show", templateVars);
} else {
  res.send("<h4>This url is not belong you</h4>")
}
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('This short URL does not exist');
  }
});

//register page route
app.get("/register", (req, res) => {
  let varTemplate = { user: users[req.session.userID] };
  res.render("register", varTemplate);
});

//registering user email and password
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generatRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      res.statusCode = 400;
      return res.send("<h4>Please Login, email registered</h4>");
      
    }

  } else {
    res.statusCode = 400;
    return res.send("<h4>Email or password can not be empty!</h4>");
  }
});

// only can delete own urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }

  return res.redirect("/urls");
});

//only can edit own urls
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});


//user can edit own links, else asked to login
app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.session['userID']) {
    res.send('<h4>User should login</h4><a href="http://localhost:8080/login">Login HERE!</a>');
  } else if (urlDatabase[req.params.shortURL].userID === req.session['userID']) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send('<h4>URL does not exist</h4>');
  }
});

// login page
app.get("/login", (req, res) => {
  const templateVars = {
    email: users[req.session.email],
    user: users[req.session.userID]
  };
  res.render('login', templateVars);
});

//adding login functionality
app.post("/login", (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.status(403);
    return res.send("<h4>Email or Password field can not be empty</h4><a href='http://localhost:8080/login'>Login HERE!</a>");
  }

  const user = getUserByEmail(req.body.email, users);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.userID;
    return res.redirect('/urls');
  } else if (user === undefined) {
    res.status(403);
    return res.send("<h4>Email and password are not matching!</h4><a href='http://localhost:8080/register'>Register HERE!</a>");
  }
});


//the Logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});