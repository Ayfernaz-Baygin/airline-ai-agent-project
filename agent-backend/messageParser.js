function normalizeAirport(text) {
  const map = {
    istanbul: "IST",
    ankara: "ANK",
    izmir: "ADB",
    antalya: "AYT",
    adana: "ADA",
    trabzon: "TZX",
    bodrum: "BJV",
  };

  const lower = text.toLowerCase().trim();

  for (const city in map) {
    if (lower.includes(city)) {
      return map[city];
    }
  }

  return null;
}

function extractFlightQueryParams(message) {
  const text = message.toLowerCase();

  let airportFrom = null;
  let airportTo = null;
  let numberOfPeople = null;

  const englishMatch = text.match(/from\s+(.+?)\s+to\s+(.+?)(?:\s+for|\s*$)/i);
  if (englishMatch) {
    airportFrom = normalizeAirport(englishMatch[1]);
    airportTo = normalizeAirport(englishMatch[2]);
  }

  const peopleMatchEn = text.match(/(\d+)\s*(people|passengers|person)/i);
  if (peopleMatchEn) {
    numberOfPeople = Number(peopleMatchEn[1]);
  }

  return {
    airportFrom,
    airportTo,
    numberOfPeople,
  };
}

function extractBookingParams(message) {
  let flightNumber = null;
  let passengerFullName = null;
  let date = null;

  const flightMatch = message.match(/\b([A-Z]{2}\d{3,4})\b/i);
  if (flightMatch) {
    flightNumber = flightMatch[1].toUpperCase();
  }

  const nameMatch = message.match(/for\s+([A-Za-zÇçĞğİıÖöŞşÜü]+)\s+([A-Za-zÇçĞğİıÖöŞşÜü]+)/i);
  if (nameMatch) {
    passengerFullName = `${capitalizeName(nameMatch[1])} ${capitalizeName(nameMatch[2])}`;
  }

  const dateMatch = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (dateMatch) {
    date = dateMatch[1];
  }

  return {
    flightNumber,
    passengerFullName,
    date,
  };
}

function extractCheckInParams(message) {
  let flightNumber = null;
  let passengerFullName = null;
  let date = null;

  const flightMatch = message.match(/\b([A-Z]{2}\d{3,4})\b/i);
  if (flightMatch) {
    flightNumber = flightMatch[1].toUpperCase();
  }

  const nameMatch = message.match(/check\s*in\s+([A-Za-zÇçĞğİıÖöŞşÜü]+)\s+([A-Za-zÇçĞğİıÖöŞşÜü]+)/i);
  if (nameMatch) {
    passengerFullName = `${capitalizeName(nameMatch[1])} ${capitalizeName(nameMatch[2])}`;
  }

  const altNameMatch = message.match(/for\s+([A-Za-zÇçĞğİıÖöŞşÜü]+)\s+([A-Za-zÇçĞğİıÖöŞşÜü]+)/i);
  if (!passengerFullName && altNameMatch) {
    passengerFullName = `${capitalizeName(altNameMatch[1])} ${capitalizeName(altNameMatch[2])}`;
  }

  const dateMatch = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (dateMatch) {
    date = dateMatch[1];
  }

  return {
    flightNumber,
    passengerFullName,
    date,
  };
}

function capitalizeName(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

module.exports = {
  extractFlightQueryParams,
  extractBookingParams,
  extractCheckInParams,
};