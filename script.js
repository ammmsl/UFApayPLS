require('dotenv').config();

const apiKey = process.env.API_KEY;
const summarySheetId = process.env.SUMMARY_SHEET_ID;
const attendanceSheetId = process.env.ATTENDANCE_SHEET_ID;


document.addEventListener("DOMContentLoaded", () => {
    loadSummaryTable();
    loadAttendanceChart();
});

async function fetchSheetData(sheetId, range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.values;
}

async function loadSummaryTable() {
    const data = await fetchSheetData(summarySheetId, "Summary Sheet!A2:E");
    const table = document.createElement("table");
    const headers = ["Name", "Total Payment", "Pending", "Prepay Balance"];
    const headerRow = document.createElement("tr");

    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    data.forEach(row => {
        const tr = document.createElement("tr");
        row.slice(1).forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    document.getElementById("playerTable").appendChild(table);
}

async function loadAttendanceChart() {
    const data = await fetchSheetData(attendanceSheetId, "AttOut!A2:E");
    const months = [...new Set(data.map(row => row[2]))];
    const sessionCounts = months.map(month => 
        data.filter(row => row[2] === month).length
    );

    const ctx = document.getElementById("attendanceChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: months,
            datasets: [{
                label: "Sessions",
                data: sessionCounts,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            onClick(event, elements) {
                if (elements.length) {
                    const index = elements[0].index;
                    const month = months[index];
                    const details = data.filter(row => row[2] === month);
                    showPopup(details);
                }
            }
        }
    });
}

function showPopup(details) {
    const popup = document.getElementById("popup");
    popup.innerHTML = "<h3>Session Details</h3><ul>" + 
        details.map(row => `<li>${row.join(", ")}</li>`).join("") + 
        "</ul>";
    popup.style.display = "block";
    popup.addEventListener("click", () => {
        popup.style.display = "none";
    });
}
