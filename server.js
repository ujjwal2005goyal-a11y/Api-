require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
console.log("File started");
const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = process.env.EMAIL;

// Utility Functions
const fibonacci = (n) => {
  if (n < 0) return null;
  let arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr.slice(0, n);
};

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const lcm = (arr) => {
  const gcd = (a, b) => (!b ? a : gcd(b, a % b));
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
};

const hcf = (arr) => {
  const gcd = (a, b) => (!b ? a : gcd(b, a % b));
  return arr.reduce((a, b) => gcd(a, b));
};


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});


app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Exactly one key required",
      });
    }

    const key = keys[0];
    const value = req.body[key];
    let result;

    switch (key) {
      case "fibonacci":
        if (typeof value !== "number" || value < 0)
          throw new Error("Invalid input");
        result = fibonacci(value);
        break;

      case "prime":
        if (!Array.isArray(value))
          throw new Error("Invalid input");
        result = value.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(value))
          throw new Error("Invalid input");
        result = lcm(value);
        break;

      case "hcf":
        if (!Array.isArray(value))
          throw new Error("Invalid input");
        result = hcf(value);
        break;

      case "AI":
        if (typeof value !== "string")
          throw new Error("Invalid input");

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: value }] }],
          }
        );

        result = response.data.candidates[0].content.parts[0].text.split(" ")[0];
        break;

      default:
        return res.status(400).json({
          is_success: false,
          error: "Invalid key",
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result,
    });

  } catch (err) {
    res.status(400).json({
      is_success: false,
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
