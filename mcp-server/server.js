require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4000;

const GATEWAY_BASE_URL = process.env.GATEWAY_BASE_URL;
const LOGIN_URL = process.env.LOGIN_URL;
const AUTH_USERNAME = process.env.AUTH_USERNAME;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[MCP] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("MCP Server is running.");
});

app.get("/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "query_flights",
        description: "Search flights by departure airport, arrival airport, and number of passengers",
        inputSchema: {
          airportFrom: "string",
          airportTo: "string",
          numberOfPeople: "number",
          page: "number"
        }
      },
      {
        name: "book_flight",
        description: "Book a flight by flight number, date, and passenger names",
        inputSchema: {
          flightNumber: "string",
          date: "string",
          passengerNames: ["string"]
        }
      },
      {
        name: "check_in",
        description: "Check in a passenger by flight number, passenger name, and date",
        inputSchema: {
          flightNumber: "string",
          passengerName: "string",
          date: "string"
        }
      }
    ]
  });
});

async function loginAndGetToken() {
  const response = await axios.post(LOGIN_URL, {
    username: AUTH_USERNAME,
    password: AUTH_PASSWORD,
  });

  if (response.data?.token) return response.data.token;
  if (response.data?.jwt) return response.data.jwt;
  if (typeof response.data === "string") return response.data;

  throw new Error("Token could not be retrieved from login response.");
}

function buildDynamicClientHeaders() {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  return {
    "X-Client-Id": `client-${unique}`,
    "X-Forwarded-For": `10.0.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
    "X-Real-IP": `172.16.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
    "User-Agent": `airline-agent-${unique}`,
  };
}

app.post("/invoke", async (req, res) => {
    console.log("[MCP INVOKE BODY]:", req.body);
  try {
    const { tool, input } = req.body;

    if (!tool) {
      return res.status(400).json({ error: "Tool name is required." });
    }

    if (tool === "query_flights") {
      const response = await axios.get(`${GATEWAY_BASE_URL}/api/v1/flights/search`, {
        params: {
          airportFrom: input.airportFrom,
          airportTo: input.airportTo,
          numberOfPeople: input.numberOfPeople || 1,
          page: input.page || 0,
        },
        headers: buildDynamicClientHeaders(),
      });

      return res.json({
        tool,
        output: response.data,
      });
    }

    if (tool === "book_flight") {
      const token = await loginAndGetToken();

      const response = await axios.post(
        `${GATEWAY_BASE_URL}/api/v1/flights/tickets/buy`,
        {
          flightNumber: input.flightNumber,
          date: input.date,
          passengerNames: input.passengerNames,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.json({
        tool,
        output: response.data,
      });
    }

    if (tool === "check_in") {
      const response = await axios.post(
        `${GATEWAY_BASE_URL}/api/v1/flights/check-in`,
        {
          flightNumber: input.flightNumber,
          passengerName: input.passengerName,
          date: input.date,
        }
      );

      return res.json({
        tool,
        output: response.data,
      });
    }

    return res.status(400).json({
      error: `Unknown tool: ${tool}`,
    });
  } catch (error) {
    console.error("MCP INVOKE ERROR:", error?.response?.data || error.message);

    return res.status(error?.response?.status || 500).json({
      error: "MCP invocation failed",
      details: error?.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});