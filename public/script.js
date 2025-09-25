// Find our form and the message block in the document
const loginForm = document.getElementById("login-form");
const messageDiv = document.getElementById("response-message");
const imageSearchForm = document.getElementById("image-search-form");
const imageContainer = document.getElementById("image-container");

// Add a "listener" for the form's submit event
loginForm.addEventListener("submit", async (event) => {
  // 1. Prevent the form's default behavior (which reloads the page)
  event.preventDefault();

  // 2. Collect data from the form fields
  const username = event.target.username.value;
  const password = event.target.password.value;

  // 3. Send a fetch request to our server
  const response = await fetch("/api/login", {
    method: "POST", // Use the POST method to send data
    headers: { "Content-Type": "application/json" }, // Tell the server we're sending JSON
    body: JSON.stringify({ username, password }), // Convert our data into a JSON string
  });

  // 4. Check if the server response was successful (HTTP status 200-299)
  if (response.ok) {
    // If login is successful, redirect the user to the welcome page.
    window.location.href = "/welcome.html";
  } else {
    // If there was an error (like 401 Unauthorized), display the error message.
    const errorResult = await response.json();
    messageDiv.textContent = errorResult.message;
    messageDiv.style.color = "red"; // Let's make errors more visible
  }
});

// Add a listener for the image search form
imageSearchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = event.target.query.value;

  // Clear previous image and show a loading message
  imageContainer.innerHTML = "Loading...";

  try {
    // Send a request to our new server endpoint
    const response = await fetch(
      `/api/image?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Image not found or server error.");
    }

    const imageData = await response.json();

    // Display the image
    imageContainer.innerHTML = `<img src="${imageData.src.medium}" alt="${imageData.alt}" style="max-width: 100%;" />`;
  } catch (error) {
    imageContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
});
