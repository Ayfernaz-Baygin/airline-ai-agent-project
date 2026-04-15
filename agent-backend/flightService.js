const axios = require("axios");

const GATEWAY_BASE_URL = process.env.GATEWAY_BASE_URL;
const LOGIN_URL = process.env.LOGIN_URL;
const AUTH_USERNAME = process.env.AUTH_USERNAME;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

async function loginAndGetToken() {
  const response = await axios.post(LOGIN_URL, {
    username: AUTH_USERNAME,
    password: AUTH_PASSWORD,
  });

  if (response.data && response.data.token) {
    return response.data.token;
  }

  if (response.data && response.data.jwt) {
    return response.data.jwt;
  }

  if (typeof response.data === "string") {
    return response.data;
  }

  throw new Error("Token could not be retrieved. Check login response format.");
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

async function queryFlights(params) {
  const response = await axios.get(`${GATEWAY_BASE_URL}/api/v1/flights/search`, {
    params: {
      airportFrom: params.airportFrom,
      airportTo: params.airportTo,
      numberOfPeople: params.numberOfPeople || 1,
      page: params.page || 0,
    },
    headers: buildDynamicClientHeaders(),
  });

  return response.data;
}

async function bookFlight(data) {
  const token = await loginAndGetToken();

  const response = await axios.post(
    `${GATEWAY_BASE_URL}/api/v1/flights/tickets/buy`,
    {
      flightNumber: data.flightNumber,
      date: data.date,
      passengerNames: data.passengerNames,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

async function checkIn(data) {
  const response = await axios.post(
    `${GATEWAY_BASE_URL}/api/v1/flights/check-in`,
    {
      flightNumber: data.flightNumber,
      passengerName: data.passengerName,
      date: data.date,
    }
  );

  return response.data;
}

module.exports = {
  queryFlights,
  bookFlight,
  checkIn,
};