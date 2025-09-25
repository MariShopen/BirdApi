// 1. Import the express framework
const express = require("express");
// Import packages to read .env file and make server-side requests
require("dotenv").config();
const fetch = require("node-fetch");

// used API - https://www.pexels.com/api/key/

// 2. Create an application instance
const app = express();
const PORT = 3001; // The port our server will run on

// --- Middleware (Промежуточное ПО) ---

// This middleware allows the server to understand JSON sent in the request body.
// Without it, `req.body` would be undefined.
app.use(express.json());

// This middleware serves all files from the 'public' folder as static files.
// Thanks to this, when you open http://localhost:3001/ in your browser, you'll see your index.html
app.use(express.static("public"));

// Our custom middleware for authorization checks.
// It will run for every request that is defined after it.
const authMiddleware = (req, res, next) => {
  console.log("Our auth middleware was triggered!");

  // Get username and password from the request body
  const { username, password } = req.body;

  // Check if they match our "secret" data
  // In a real application, this would be a database check!
  if (username === "user" && password === "123") {
    console.log("User is valid. Passing to the next handler.");
    // If everything is okay, call next() to pass control to the next handler (our route)
    next();
  } else {
    console.log("Invalid credentials. Sending an error.");
    // If the credentials are wrong, send an error response and do not call next()
    res.status(401).json({ message: "Error: Invalid username or password!" });
  }
};

// --- Routing ---

// 4. Create a route (endpoint) to handle POST requests to /api/login
// The request will first go through `authMiddleware`, and only if it calls `next()`,
// will the next handler be executed.
app.post("/api/login", authMiddleware, (req, res) => {
  // This code will only run if the middleware allowed the request to pass
  console.log("Request reached the main route handler.");

  // Send a successful response to the client
  res
    .status(200)
    .json({ message: "Success: You have logged in successfully!" });
});

// Route to handle image search requests
app.get("/api/image", async (req, res) => {
  // Get the search query from the request URL (e.g., /api/image?query=cats)
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ message: "Error: Search query is required." });
  }

  const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&per_page=1`;

  try {
    const pexelsResponse = await fetch(pexelsUrl, {
      headers: {
        Authorization: process.env.API_KEY, // Use the API key from .env
      },
    });

    const data = await pexelsResponse.json();

    // Send the random photo from array of photos found back to the client
    const allPhotos = data.photos;
    const randomPhoto = allPhotos[Math.floor(Math.random() * allPhotos.length)];
    console.log("allPhoots:", allPhotos);

    res.status(200).json(randomPhoto);
  } catch (error) {
    res.status(500).json({ message: "Error fetching image from Pexels." });
  }
});
// 5. Start the server
app.listen(PORT, () => {
  // This callback will run when the server is ready to accept requests
  console.log(`Server is running and listening on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser.`);
});
