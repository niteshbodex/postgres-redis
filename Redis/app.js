const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const axios = require("axios");

const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");
const USERS_API = "https://jsonplaceholder.typicode.com/users/";

// Create Redis Client
let client = redis.createClient();

client.on("connect", function () {
  console.log("✅ 💃Connected to Redis...");
});
client.set("key", "value", redis.print);
client.get("key", redis.print);
// Set Port
const port = 3000;

// Init apps
const app = express();

// View Engine\
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// methodOverride
app.use(methodOverride("_method"));

// Search Page
// app.get("/", function (req, res, next) {
//   res.render("searchusers");
// });

app.get("/", function (req, res, next) {
  res.render("index");
});

app.get("/users", (req, res, next) => {
  client.hgetall("key");
  res.render("showusers");
});

// Search processing
app.post("/user/search", (req, res) => {
  let id = req.body.id;

  client.hgetall(id, function (err, obj) {
    if (!obj) {
      res.render("searchusers", {
        error: "User does not exist",
      });
    } else {
      obj.id = id;
      res.render("details", {
        user: obj,
      });
    }
  });
});

// Add User Page
app.get("/user/add", (req, res) => {
  res.render("adduser");
});

app.get("/cached-users", (req, res) => {
  try {
    client.get("users", (err, data) => {
      if (err) {
        console.error(err);
        throw err;
      }

      if (data) {
        console.log("Users retrieved from Redis");
        res.status(200).send(JSON.parse(data));
      } else {
        axios.get(`${USERS_API}`).then(function (response) {
          const users = response.data;
          client.setex("users", 600, JSON.stringify(users));
          console.log("Users retrieved from the API");
          res.status(200).send(users);
        });
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Process Add User Page
app.post("/user/add", function (req, res, next) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone,
    ],
    function (err, reply) {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

// Delete User
app.delete("/user/delete/:id", function (req, res, next) {
  client.del(req.params.id);
  res.redirect("/");
});

app.get("/users/listusers", async (req, res) => {
  // client.hgetall('key'), {
  //   res.render("details", {});
  // });
  await client.hgetall("key");
  res.render("helloall", {});
});

app.get("/redis-cached-photos", (req, res) => {
  try {
    redisclient.get("photos", (err, data) => {
      if (err) {
        console.error(err);
        throw err;
      }
      if (data) {
        console.log("Photos retrieved from redis");
        res.status(200).send(JSON.parse(data));
      } else {
        axios.get(`${PHOTOS_API}`).then((response) => {
          const photos = response.data;
          redisclient.setex("photos", 600, JSON.stringify(photos));
          console.log("Photos retrieved from the API");
          res.status(200).send(photos);
        });
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(port, function () {
  console.log("Server started on port " + `http://localhost:${port}`);
});
