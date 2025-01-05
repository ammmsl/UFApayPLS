// CSV URLs
const SUMMARY_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZfFNDYouOQCZjMKv6g0pVpePg7nvx5qMuaVuRjXxnhVd7qDR_Spb-L1BAiD3LQTKyil4xd_GGX81-/pub?gid=256158700&single=true&output=csv';
const ATTENDANCE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZfFNDYouOQCZjMKv6g0pVpePg7nvx5qMuaVuRjXxnhVd7qDR_Spb-L1BAiD3LQTKyil4xd_GGX81-/pub?gid=1655414989&single=true&output=csv';

let summaryData = [];
let attendanceData = [];

// Parse CSV string to array
function parseCSV(csv) {
    const lines = csv.split('\n');
    return lines.map(line => {
        // Handle cases where fields might contain commas within quotes
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        return matches.map(field => field.replace(/^"|"$/g, '').trim());
    });
}

// Fetch and parse CSV data
async function fetchCSVData(url) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching CSV:', error);
        return [];
    }
}

// Load all data
async function loadData() {
    // Show loading indicators
    document.getElementById('summaryLoading').style.display = 'block';
    document.getElementById('attendanceLoading').style.display = 'block';

    try {
        // Fetch both CSVs concurrently
        [summaryData, attendanceData] = await Promise.all([
            fetchCSVData(SUMMARY_URL),
            fetchCSVData(ATTENDANCE_URL)
        ]);

        // Remove headers
        summaryData = summaryData.slice(1);
        attendanceData = attendanceData.slice(1);

        populateNameDropdown();
        populateMonthDropdown();
        updateTables();
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        // Hide loading indicators
        document.getElementById('summaryLoading').style.display = 'none';
        document.getElementById('attendanceLoading').style.display = 'none';
    }
}

// Populate the name dropdown
function populateNameDropdown() {
    const nameSelect = document.getElementById('nameFilter');
    const names = [...new Set(summaryData.map(row => row[1]))].sort();
    
    nameSelect.innerHTML = '<option value="">Select Name</option>';
    names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameSelect.appendChild(option);
    });
}

// Populate the month dropdown
function populateMonthDropdown() {
    const monthSelect = document.getElementById('monthFilter');
    const months = [...new Set(attendanceData.map(row => row[2]))].sort();
    
    monthSelect.innerHTML = '<option value="">Select Month</option>';
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
}

// Update both tables based on filters
function updateTables() {
    const selectedName = document.getElementById('nameFilter').value;
    const selectedMonth = document.getElementById('monthFilter').value;

    // Update summary table
    const summaryTableBody = document.querySelector('#summaryTable tbody');
    summaryTableBody.innerHTML = '';

    const filteredSummary = summaryData.filter(row => 
        !selectedName || row[1] === selectedName
    );

    filteredSummary.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row[1]}</td>
            <td>${row[6]}</td>
            <td>${row[5]}</td>
        `;
        summaryTableBody.appendChild(tr);
    });

    // Update attendance table
    const attendanceTableBody = document.querySelector('#attendanceTable tbody');
    attendanceTableBody.innerHTML = '';

    const filteredAttendance = attendanceData.filter(row =>
        (!selectedName || row[0] === selectedName) &&
        (!selectedMonth || row[2] === selectedMonth)
    );

    filteredAttendance.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row[0]}</td>
            <td>${row[1]}</td>
            <td>${row[2]}</td>
            <td>${row[3]}</td>
            <td>${row[4]}</td>
        `;
        attendanceTableBody.appendChild(tr);
    });
}

// Add event listeners
document.getElementById('nameFilter').addEventListener('change', updateTables);
document.getElementById('monthFilter').addEventListener('change', updateTables);

// Initialize data loading
loadData();
