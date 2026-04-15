 # Airline AI Agent

This project is an AI-powered airline assistant that allows users to search flights, book tickets, and perform check-in operations through a chat-based interface.

It was developed as part of the Software Architecture & Design course (Assignment 2).

---

## Features

- Natural language chat interface
- Flight search
- Ticket booking
- Passenger check-in
- AI-powered intent detection
- MCP (Model Context Protocol) server integration
- Gateway-based API communication

---

## System Architecture
The LLM is responsible for understanding user input, extracting intent and parameters, and deciding which tool to invoke. The selected tool is then executed through the MCP server.

The system follows a modular AI agent architecture:
Frontend (React Chat UI)
↓
Agent Backend (Node.js)
↓
LLM (Ollama - local model)
↓
MCP Client
↓
MCP Server
↓
API Gateway
↓
Airline Backend API (Midterm Project)


---

## Technologies Used

### Frontend
- React.js
- Axios

### Backend
- Node.js
- Express.js

### AI / LLM
- Ollama (local LLM)

### Integration
- MCP Server (custom implementation)
- REST APIs
- API Gateway

---

## Project Structure

frontend/ → React chat application
agent-backend/ → AI agent + LLM integration
mcp-server/ → MCP server (tool handler)


---

## Supported Operations

### Flight Search
Example: Find flights from Istanbul to Ankara for 2 people

### Booking
Example:

Book flight TK1001 for Ayfernaz Baygın on 2026-03-30

### Check-in
Example:

Check in Ayfernaz Baygın for flight TK1001 on 2026-03-30


---

## Setup Instructions

### 1. Clone the repository

git clone https://github.com/Ayfernaz-Baygin/airline-ai-agent-project.git

cd airline-ai-agent-project


---

### 2. Install dependencies

## Frontend

cd frontend
npm install
npm start

## Agent Backend

cd agent-backend
npm install
npm start


## MCP Server

cd mcp-server
npm install
npm start


---

## Assumptions

- The API Gateway is already deployed and accessible
- The airline backend API (midterm project) is running
- Ollama is installed and running locally

---

##  Challenges & Issues

- Handling LLM JSON parsing errors
- Managing rate limits (initially with OpenAI)
- Migrating to local LLM (Ollama)
- Designing MCP server for tool-based architecture
- Ensuring correct mapping between tools and API endpoints
- Cleaning sensitive data (API keys, .env files) before GitHub push

---

## Demo Video

(Add your video link here)

---

## Notes

- All API requests are routed through the API Gateway
- MCP server handles tool invocation and routing logic
- The system is designed to be modular and easily extendable
- MCP server maps high-level tools (query_flights, book_flight, check_in) to actual API Gateway endpoints
- All API requests strictly go through the API Gateway as required by the assignment

 
## Design Decisions

- A modular architecture was preferred to separate concerns (frontend, agent, MCP server)
- MCP layer was introduced to decouple tool logic from the agent
- Local LLM (Ollama) was used to avoid API rate limits and external dependencies
- Gateway-based communication ensures scalability and security