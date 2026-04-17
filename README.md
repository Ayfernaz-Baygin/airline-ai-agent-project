# Airline AI Agent Project

## SE 4458 – Assignment 2
### AI Agent Chat Application for Flight Services

**Ayfernaz Baygın - 22070006068**

---

# Project Overview

This project is an AI-powered chat application that allows users to interact with airline services using natural language.

Users can:

- Query Flights
- Book Flights
- Check In

The system uses an AI Agent architecture where the LLM understands user intent, selects the correct tool, and communicates with backend APIs through an MCP server and API Gateway.

---

# Features

## Query Flights

Users can search available flights by typing messages like:

```bash
Find flights from Istanbul to Frankfurt on May 10
Search flights from IST to FRA
Book Flight

Users can book a selected flight:

Book flight TK1523
I want to reserve LH1301
Check In

Users can complete check-in:

Check in for TK1523
Check-in with ticket number 74562189
System Architecture
Frontend (React Chat UI)
⬇
Agent Backend (Node.js)
⬇
LLM (Ollama – Intent & Tool Selection)
⬇
MCP Client
⬇
MCP Server (Tool Mapping Layer)
⬇
API Gateway
⬇
Midterm Flight APIs

The MCP server is responsible for mapping high-level tools (query_flights, book_flight, check_in) to actual API Gateway endpoints.

Technologies Used
Layer	Technology
Frontend	React.js
Backend	Node.js, Express.js
AI / LLM	Ollama (Local LLM)
Tool Layer	Custom MCP Server
API Communication	Axios
APIs	REST APIs
How It Works

The LLM is responsible for understanding user intent and selecting the correct tool to execute.

All API calls are strictly routed through the API Gateway as required by the assignment.

User sends a message in chat
Frontend sends the message to Agent Backend
Backend asks the LLM to understand user intent
LLM selects one of the tools:
query_flights
book_flight
check_in
Backend sends tool request to MCP Server
MCP Server routes request to API Gateway
Gateway calls Midterm APIs
Response is shown in chat UI
Setup Instructions
1. Clone Repository
git clone https://github.com/Ayfernaz-Baygin/airline-ai-agent-project.git
cd airline-ai-agent-project
2. Install Dependencies
Frontend
cd frontend
npm install
Agent Backend
cd ../agent-backend
npm install
MCP Server
cd ../mcp-server
npm install
Environment Variables

Create a .env file inside mcp-server:

GATEWAY_BASE_URL=http://localhost:8080
LOGIN_URL=http://localhost:8080/login
AUTH_USERNAME=test
AUTH_PASSWORD=test
Run Project
Start Ollama
ollama run llama3
Start MCP Server
cd mcp-server
node server.js
Start Agent Backend
cd agent-backend
node server.js
Start Frontend
cd frontend
npm start
Assumptions
Midterm APIs are already implemented and working
API Gateway is available
Authentication uses constant username/password
Ollama is installed locally
User enters valid flight or ticket information
Challenges Encountered
Parsing natural language into structured parameters
Handling invalid JSON responses from LLM
Mapping tools correctly to gateway endpoints
Connecting multiple services together
Managing chat UI state dynamically
Design Decisions
Local LLM used instead of cloud APIs
MCP layer added for modularity
Gateway architecture preserved
React chosen for fast UI development
Fallback keyword intent detection added for reliability

Demo Video:

https://youtu.be/QTsKBmDecjc

GitHub Repository:

https://github.com/Ayfernaz-Baygin/airline-ai-agent-project.git