const redis = require("redis");
// const client = redis.createClient();
const cors = require("cors");
const axios = require("axios");
const express = require("express");

const app = express();
app.use(cors());

const USERS_API = "https://jsonplaceholder.typicode.com/users/";
const PHOTOS_API = "https://jsonplaceholder.typicode.com/photos/";
const POSTS_API = "https://jsonplaceholder.typicode.com/posts/";
let redisclient = redis.createClient();

redisclient.on("connect", function () {
  console.log("✅ 💃 Connected to Redis...");
});
redisclient.set("key", "value", redis.print);
redisclient.get("key", redis.print);

app.get("/users", (req, res) => {
  try {
    axios.get(`${USERS_API}`).then((response) => {
      const users = response.data;
      console.log("Users retrieved from the API");
      res.status(200).send(users);
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/photos", (req, res) => {
  try {
    axios.get(`${PHOTOS_API}`).then((response) => {
      const photos = response.data;
      console.log("Photos retrieved from the API");
      res.status(200).send(photos);
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/posts", (req, res) => {
  try {
    axios.get(`${POSTS_API}`).then((response) => {
      const posts = response.data;
      console.log("Posts retrieved from the API");
      res.status(200).send(posts);
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/cached-users", (req, res) => {
  try {
    redisclient.get("users", (err, data) => {
      if (err) {
        console.error(err);
        throw err;
      }
      if (data) {
        console.log("Users retrieved from Redis");
        res.status(200).send(JSON.parse(data));
      } else {
        axios.get(`${USERS_API}`).then((response) => {
          const users = response.data;
          redisclient.setex("users", 600, JSON.stringify(users));
          console.log(`Users retrieved from the API `);
          res.status(200).send(users);
        });
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
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

app.get("/redis-cached-posts", (req, res) => {
  try {
    redisclient.get("posts", (err, data) => {
      if (err) {
        console.error(err);
        throw err;
      }
      if (data) {
        console.log("Posts retrieved from redis");
        res.status(200).send(JSON.parse(data));
      } else {
        axios.get(`${POSTS_API}`).then((response) => {
          const posts = response.data;
          redisclient.setex("posts", 600, JSON.stringify(posts));
          console.log("Posts retrieved from the API");
          res.status(200).send(posts);
        });
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ 💃Server started at port: http://localhost:${PORT}`);
});
