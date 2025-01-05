// URLs for the CSV files
const summaryCSVUrl = "./data/summary.csv";
const attendanceCSVUrl = "./data/attendance.csv";;

// Utility to parse CSV data
const parseCSV = (csvData) => {
  const rows = csvData.split("\n").map(row => row.split(","));
  const headers = rows[0];
  const data = rows.slice(1).filter(row => row.length === headers.length).map(row =>
    headers.reduce((acc, header, i) => {
      acc[header.trim()] = row[i].trim();
      return acc;
    }, {})
  );
  return data;
};

// Fetch and parse CSV files
const fetchCSV = async (url) => {
  const response = await fetch(url);
  const data = await response.text();
  return parseCSV(data);
};

// Populate filters with unique names and months
const populateFilters = (names, months) => {
  const nameFilter = document.getElementById("nameFilter");
  names.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    nameFilter.appendChild(option);
  });

  const monthFilter = document.getElementById("monthFilter");
  months.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthFilter.appendChild(option);
  });
};

// Populate tables with data
const populateTables = (summaryData, attendanceData) => {
  const pendingTable = document.getElementById("pendingTable");
  const attendanceTable = document.getElementById("attendanceTable");

  summaryData.forEach(row => {
    const tr = document.createElement("tr");
    ["Name", "Pending", "Prepay Balance"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = row[key];
      tr.appendChild(td);
    });
    pendingTable.appendChild(tr);
  });

  attendanceData.forEach(row => {
    const tr = document.createElement("tr");
    ["Name", "Location", "Month", "Date", "Cost Per Session"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = row[key];
      tr.appendChild(td);
    });
    attendanceTable.appendChild(tr);
  });
};

// Main function to load and display data
(async () => {
  try {
    const summaryData = await fetchCSV(summaryCSVUrl);
    const attendanceData = await fetchCSV(attendanceCSVUrl);

    const names = [...new Set(summaryData.map(row => row.Name))];
    const months = [...new Set(attendanceData.map(row => row.Month))];

    populateFilters(names, months);
    populateTables(summaryData, attendanceData);
  } catch (error) {
    console.error("Error fetching or parsing CSV data:", error);
  }
})();
