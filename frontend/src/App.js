import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const [airportFrom, setAirportFrom] = useState("IST");
  const [airportTo, setAirportTo] = useState("ANK");
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const [flightNumber, setFlightNumber] = useState("");
  const [passengerName, setPassengerName] = useState("Ayfernaz");
  const [passengerSurname, setPassengerSurname] = useState("Baygın");
  const [passengerEmail, setPassengerEmail] = useState("ayfernaz@example.com");
  const [date, setDate] = useState("2026-03-30");

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    const updatedChat = [...chat, userMessage];
    setChat(updatedChat);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/chat", {
        message,
        history: updatedChat.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        context: {
          airportFrom,
          airportTo,
          numberOfPeople: Number(numberOfPeople),
          flightNumber,
          passengerName,
          passengerSurname,
          passengerEmail,
          date,
          page: 0,
        },
      });

      const agentMessage = {
        sender: "agent",
        text: response.data.reply,
        data: response.data.data,
      };

      setChat((prev) => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "agent",
        text: "An error occurred.",
        data: error?.response?.data || error.message,
      };
      setChat((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  const handleQuickPrompt = (text) => {
    setMessage(text);
  };

  const renderFlights = (data) => {
    if (!data || !data.content || !Array.isArray(data.content)) return null;

    return (
      <div className="flight-list">
        {data.content.map((flight, index) => (
          <div key={index} className="flight-card">
            <div className="flight-card-header">
              <span className="flight-number">{flight.flightNumber}</span>
              <span className="seat-badge">{flight.availableSeats} seats</span>
            </div>

            <div className="flight-route">
              <span>{flight.airportFrom}</span>
              <span className="arrow">→</span>
              <span>{flight.airportTo}</span>
            </div>

            <div className="flight-times">
              <div>
                <div className="label">Departure</div>
                <div>{formatDateTime(flight.departureDateTime)}</div>
              </div>
              <div>
                <div className="label">Arrival</div>
                <div>{formatDateTime(flight.arrivalDateTime)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBookingResult = (data) => {
    if (!data || !data.transactionStatus || !data.ticketNumbers) return null;

    return (
      <div className="result-card success">
        <div className="result-title">Booking Result</div>
        <div className="result-line">
          <span>Status:</span>
          <strong>{data.transactionStatus}</strong>
        </div>
        <div className="result-line">
          <span>Ticket Numbers:</span>
          <div className="tag-group">
            {data.ticketNumbers.map((ticket, index) => (
              <span key={index} className="tag">
                #{ticket}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCheckInResult = (data) => {
    if (!data || !data.transactionStatus || !data.seatNumber) return null;

    return (
      <div className="result-card success">
        <div className="result-title">Check-in Result</div>
        <div className="result-line">
          <span>Status:</span>
          <strong>{data.transactionStatus}</strong>
        </div>
        <div className="result-line">
          <span>Seat Number:</span>
          <span className="tag">{data.seatNumber}</span>
        </div>
      </div>
    );
  };

  const renderData = (data) => {
    if (!data) return null;

    if (data.content) {
      return (
        <>
          {renderFlights(data)}
          <details className="raw-data">
            <summary>Show raw JSON</summary>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </details>
        </>
      );
    }

    if (data.ticketNumbers) {
      return (
        <>
          {renderBookingResult(data)}
          <details className="raw-data">
            <summary>Show raw JSON</summary>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </details>
        </>
      );
    }

    if (data.seatNumber) {
      return (
        <>
          {renderCheckInResult(data)}
          <details className="raw-data">
            <summary>Show raw JSON</summary>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </details>
        </>
      );
    }

    return (
      <details className="raw-data" open>
        <summary>Response Data</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </details>
    );
  };

  return (
    <div className="app-shell">
      <div className="container">
        <header className="hero">
          <h1>✈️ Airline AI Agent</h1>
          <p>
            Search flights, book tickets, and complete check-in through a
            chat-based interface.
          </p>
        </header>

        <div className="top-grid">
          <div className="panel">
            <h2>Flight Search Context</h2>
            <input
              value={airportFrom}
              onChange={(e) => setAirportFrom(e.target.value)}
              placeholder="Departure Airport"
            />
            <input
              value={airportTo}
              onChange={(e) => setAirportTo(e.target.value)}
              placeholder="Arrival Airport"
            />
            <input
              type="number"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.value)}
              placeholder="Number of Passengers"
            />
          </div>

          <div className="panel">
            <h2>Booking / Check-in Context</h2>
            <input
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="Flight Number"
            />
            <input
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="Passenger Name"
            />
            <input
              value={passengerSurname}
              onChange={(e) => setPassengerSurname(e.target.value)}
              placeholder="Passenger Surname"
            />
            <input
              value={passengerEmail}
              onChange={(e) => setPassengerEmail(e.target.value)}
              placeholder="Passenger Email"
            />
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Date (YYYY-MM-DD)"
            />
          </div>
        </div>

        <div className="panel quick-actions">
          <h2>Quick Prompts</h2>
          <div className="quick-buttons">
            <button
              onClick={() =>
                handleQuickPrompt(
                  "Search a flight from Istanbul to Ankara for 2 people"
                )
              }
            >
              Search Flights
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  "Book flight TK1001 for Ayfernaz Baygın on 2026-03-30"
                )
              }
            >
              Book Flight
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  "Check in Ayfernaz Baygın for flight TK1001 on 2026-03-30"
                )
              }
            >
              Check-in
            </button>
          </div>
        </div>

        <div className="chat-box">
          {chat.length === 0 && (
            <div className="empty-state">
              <p>No messages yet.</p>
              <span>Try one of the quick prompts above.</span>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <div className="message-header">
                {msg.sender === "user" ? "You" : "Agent"}
              </div>
              <div className="message-text">{msg.text}</div>
              {msg.data && (
                <div className="message-data">{renderData(msg.data)}</div>
              )}
            </div>
          ))}
        </div>

        <div className="input-row">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Type a message, e.g. "Book flight TK1001 for Ayfernaz Baygın on 2026-03-30"'
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "-";
  return value.replace("T", " ");
}

export default App;