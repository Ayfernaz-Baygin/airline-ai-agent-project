const axios = require("axios");

const OLLAMA_BASE_URL = "http://localhost:11434/api";
const OLLAMA_MODEL = "llama3.2";

function fixJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      let fixedText = text.trim();

      if (!fixedText.endsWith("}")) {
        fixedText += "}";
      }

      return JSON.parse(fixedText);
    } catch (err) {
      console.log("JSON STILL BROKEN:", text);
      return { intent: "UNKNOWN" };
    }
  }
}

async function parseWithLLM(message) {
  try {
    const prompt = `
Extract intent and parameters from the user's message.

Return ONLY valid JSON.
Do not add markdown.
Do not add explanation.

Use this exact schema:
{
  "intent": "QUERY_FLIGHT | BOOK_FLIGHT | CHECK_IN | UNKNOWN",
  "airportFrom": "",
  "airportTo": "",
  "numberOfPeople": "",
  "flightNumber": "",
  "passengerName": "",
  "date": ""
}

Rules:
- intent must be one of QUERY_FLIGHT, BOOK_FLIGHT, CHECK_IN, UNKNOWN
- airportFrom and airportTo should use airport codes if possible (e.g. Istanbul -> IST, Ankara -> ANK)
- passengerName should be the full passenger name as one string
- date should be in YYYY-MM-DD if present
- if a field is missing, return an empty string
- always close JSON properly with }
- never truncate output
- return JSON only

Message:
"${message}"
`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/chat`, {
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You extract structured travel intent and parameters from user messages. Return only raw JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      options: {
        temperature: 0
      }
    });

    const text = response.data?.message?.content?.trim();

    if (!text) {
      return { intent: "UNKNOWN" };
    }

    return fixJson(text);
  } catch (error) {
    console.log("OLLAMA ERROR:", error?.response?.data || error.message);
    return { intent: "UNKNOWN" };
  }
}

module.exports = { parseWithLLM };