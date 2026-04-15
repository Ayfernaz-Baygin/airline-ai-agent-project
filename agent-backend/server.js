require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  extractFlightQueryParams,
  extractBookingParams,
  extractCheckInParams,
} = require("./messageParser");
const { parseWithLLM } = require("./llmService");
const { invokeTool } = require("./mcpClient");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Agent Backend is running.");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, context, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        reply: "Message cannot be empty.",
      });
    }

    const llmResult = await parseWithLLM(message, history || []);

    let intent = llmResult.intent;

    if (!intent || intent === "UNKNOWN") {
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("search") || lowerMessage.includes("find")) {
        intent = "QUERY_FLIGHT";
      } else if (
        lowerMessage.includes("book") ||
        lowerMessage.includes("buy") ||
        lowerMessage.includes("purchase") ||
        lowerMessage.includes("reserve")
      ) {
        intent = "BOOK_FLIGHT";
      } else if (
        lowerMessage.includes("check-in") ||
        lowerMessage.includes("check in") ||
        lowerMessage.includes("checkin")
      ) {
        intent = "CHECK_IN";
      } else {
        intent = "UNKNOWN";
      }
    }

    if (intent === "QUERY_FLIGHT") {
      const extracted = extractFlightQueryParams(message);

      const finalAirportFrom =
        llmResult.airportFrom || extracted.airportFrom || context?.airportFrom;

      const finalAirportTo =
        llmResult.airportTo || extracted.airportTo || context?.airportTo;

      const finalNumberOfPeople =
        Number(llmResult.numberOfPeople) ||
        extracted.numberOfPeople ||
        context?.numberOfPeople ||
        1;

      if (!finalAirportFrom || !finalAirportTo) {
        return res.json({
          reply:
            "Please provide both departure and arrival locations. Example: Search a flight from Istanbul to Ankara for 2 people.",
        });
      }

      const flights = await invokeTool("query_flights", {
        airportFrom: finalAirportFrom,
        airportTo: finalAirportTo,
        numberOfPeople: finalNumberOfPeople,
        page: context?.page || 0,
      });

      return res.json({
        reply: `Flights retrieved successfully. Parameters used: ${finalAirportFrom} → ${finalAirportTo}, passengers: ${finalNumberOfPeople}`,
        data: flights,
      });
    }

    if (intent === "BOOK_FLIGHT") {
      const extracted = extractBookingParams(message);

      const finalFlightNumber =
        llmResult.flightNumber ||
        extracted.flightNumber ||
        context?.flightNumber;

      const finalPassengerFullName =
        llmResult.passengerName ||
        extracted.passengerFullName ||
        (context?.passengerName && context?.passengerSurname
          ? `${context.passengerName} ${context.passengerSurname}`
          : null);

      const finalDate =
        llmResult.date || extracted.date || context?.date;

      if (!finalFlightNumber || !finalPassengerFullName || !finalDate) {
        return res.json({
          reply:
            "To book a flight, please provide flight number, passenger full name, and date. Example: Book flight TK1001 for Ayfernaz Baygın on 2026-03-30",
        });
      }

      const result = await invokeTool("book_flight", {
        flightNumber: finalFlightNumber,
        date: finalDate,
        passengerNames: [finalPassengerFullName],
      });

      return res.json({
        reply: `Flight booked successfully for ${finalPassengerFullName}.`,
        data: result,
      });
    }

    if (intent === "CHECK_IN") {
      const extracted = extractCheckInParams(message);

      const finalFlightNumber =
        llmResult.flightNumber ||
        extracted.flightNumber ||
        context?.flightNumber;

      const finalPassengerName =
        llmResult.passengerName ||
        extracted.passengerFullName ||
        (context?.passengerName && context?.passengerSurname
          ? `${context.passengerName} ${context.passengerSurname}`
          : context?.passengerName || null);

      const finalDate =
        llmResult.date || extracted.date || context?.date;

      if (!finalFlightNumber || !finalPassengerName || !finalDate) {
        return res.json({
          reply:
            "To complete check-in, please provide flight number, passenger full name, and date. Example: Check in Ayfernaz Baygın for flight TK1001 on 2026-03-30",
        });
      }

      const result = await invokeTool("check_in", {
        flightNumber: finalFlightNumber,
        passengerName: finalPassengerName,
        date: finalDate,
      });

      return res.json({
        reply: `Check-in completed successfully for ${finalPassengerName}.`,
        data: result,
      });
    }

    return res.json({
      reply:
        "I can help you search flights, book tickets, and complete check-in.",
    });
  } catch (error) {
    console.error("CHAT ERROR:", error?.response?.data || error.message);

    if (error?.response?.status === 429) {
      return res.json({
        reply: "Rate limit exceeded. Please try again later.",
      });
    }

    return res.status(500).json({
      reply: "An error occurred during the operation.",
      error: error?.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Agent backend running on port ${PORT}`);
});