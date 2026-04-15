const axios = require("axios");

const MCP_SERVER_URL = "http://localhost:4000";

async function invokeTool(tool, input) {
  const response = await axios.post(`${MCP_SERVER_URL}/invoke`, {
    tool,
    input,
  });

  return response.data.output;
}

module.exports = { invokeTool };