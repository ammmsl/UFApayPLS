const apiKey = "AIzaSyB4FKQrbrtGpBztkZVriYkEGsXlnLXHAN0";
const sheetID = "1kI6E4J0pL4lUa2NH-FYEd2rWUE7Uzsz-CnGOg68ERtc";
const baseURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values`;

const fetchData = async (sheetName) => {
  const response = await fetch(`${baseURL}/${sheetName}?key=${apiKey}`);
  const data = await response.json();
  return data.values;
};

const populateFilters = (names, months) => {
  const nameFilter = document.getElementById("nameFilter");
  names.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    nameFilter.appendChild(option);
  });

  // Sort months in chronological order
  const monthOrder = [
    "January", "February", "March", "April", "May", "June", "July", "August", 
    "September", "October", "November", "December"
  ];

  const sortedMonths = months.sort((a, b) => {
    return monthOrder.indexOf(a) - monthOrder.indexOf(b); // Sort by month name order
  });

  const monthFilter = document.getElementById("monthFilter");
  sortedMonths.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthFilter.appendChild(option);
  });
};

const populateTables = (summaryData, attendanceData) => {
  const pendingTable = document.getElementById("pendingTable");
  const attendanceTable = document.getElementById("attendanceTable");

  summaryData.forEach(row => {
    const tr = document.createElement("tr");
    row.slice(1, 4).forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    pendingTable.appendChild(tr);
  });

  attendanceData.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    attendanceTable.appendChild(tr);
  });
};

const applyFilters = () => {
  const nameFilter = document.getElementById("nameFilter").value;
  const monthFilter = document.getElementById("monthFilter").value;

  const pendingTable = document.getElementById("pendingTable");
  const attendanceTable = document.getElementById("attendanceTable");

  // Filter Pending Records
  Array.from(pendingTable.rows).forEach(row => {
    const name = row.cells[0]?.textContent;
    row.style.display = (nameFilter === "all" || name === nameFilter) ? "" : "none";
  });

  // Filter Attendance Records
  Array.from(attendanceTable.rows).forEach(row => {
    const name = row.cells[0]?.textContent;
    const month = row.cells[2]?.textContent;
    row.style.display = (
      (nameFilter === "all" || name === nameFilter) &&
      (monthFilter === "all" || month === monthFilter)
    ) ? "" : "none";
  });
};

const filterPendingPayments = () => {
  const pendingTable = document.getElementById("pendingTable");

  Array.from(pendingTable.rows).forEach(row => {
    const pendingPayment = parseFloat(row.cells[1]?.textContent || "0");
    row.style.display = pendingPayment !== 0 ? "" : "none";
  });
};

// Attach Event Listener to Filter Pending Button
document.getElementById("filterPendingButton").addEventListener("click", filterPendingPayments);

let isShowingPendingOnly = true; // Track the toggle state

const togglePendingPayments = () => {
  const pendingTable = document.getElementById("pendingTable");
  const button = document.getElementById("filterPendingButton");

  if (isShowingPendingOnly) {
    // Show all records
    Array.from(pendingTable.rows).forEach(row => {
      row.style.display = ""; // Reset display
    });
    button.textContent = "Show Pending Payments";
  } else {
    // Show only rows where "Pending payment" is not 0
    Array.from(pendingTable.rows).forEach(row => {
      const pendingPayment = parseFloat(row.cells[1]?.textContent || "0");
      row.style.display = pendingPayment !== 0 ? "" : "none";
    });
    button.textContent = "Show All Records";
  }

  isShowingPendingOnly = !isShowingPendingOnly; // Toggle the state
};

// Attach Event Listener to the Button
document.getElementById("filterPendingButton").addEventListener("click", togglePendingPayments);
document.getElementById("filterPendingButton").textContent = "Show All Records"; // Set the initial state of the button text

let isShowingPrepayOnly = false; // Track the toggle state for Prepay records

const togglePrepayRecords = () => {
  const pendingTable = document.getElementById("pendingTable"); 
  const button = document.getElementById("filterPrepayButton"); 

  if (isShowingPendingOnly) {
    // Show all records
    Array.from(pendingTable.rows).forEach(row => {
      row.style.display = ""; // Reset display
    });
    button.textContent = "Show Prepay Balance";
  } else {
      Array.from(pendingTable.rows).forEach(row => {
      const pendingPayment = parseFloat(row.cells[1]?.textContent || "0");
      row.style.display = pendingPayment == 0 ? "" : "none";
    });
    button.textContent = "Show All Records";
  }

  isShowingPendingOnly = !isShowingPendingOnly; // Toggle the state
};

// Attach Event Listener to the new Button
document.getElementById("filterPrepayButton").addEventListener("click", togglePrepayRecords);

// Main Function
(async () => {
  const summaryData = await fetchData("Summary Sheet");
  const attendanceData = await fetchData("AttendOut");

  console.log("Summary Data:", summaryData);
  console.log("Attendance Data:", attendanceData);

  const names = [...new Set(summaryData.slice(1).map(row => row[1]))];
  const months = [...new Set(attendanceData.slice(1).map(row => row[2]))];

  populateFilters(names, months);
  populateTables(summaryData.slice(1), attendanceData.slice(1));

  // Attach Event Listeners for Filtering
  document.getElementById("nameFilter").addEventListener("change", applyFilters);
  document.getElementById("monthFilter").addEventListener("change", applyFilters);
})();
