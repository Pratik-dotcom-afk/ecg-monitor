const ctx = document.getElementById('ecgChart').getContext('2d');

// Initialize the chart
const ecgChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Full labels stored as raw timestamps
        datasets: [
            {
                label: 'ECG Signal',
                data: [], // Full data stored
                borderColor: 'rgb(10, 131, 8)',
                tension: 0.1,
                pointRadius: 0 // Prevents point rendering for performance
            }
        ]
    },
    options: {
        responsive: true,
        animation: false, // Disable animations for real-time performance
        scales: {
            x: {
                type: 'linear', // Linear scale for timestamps
                display: true,
                ticks: {
                    callback: function (value) {
                        // Format raw timestamp into IST for display
                        const date = new Date(value * 1000); // Convert seconds to milliseconds
                        return date.toLocaleTimeString('en-IN', { hour12: true });
                    }
                }
            },
            y: {
                display: true,
                min: 0,
                max: 5000
            }
        },
        plugins: {
            legend: { display: true }
        }
    }
});

// Function to fetch data continuously
function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(({ ecg, timestamp }) => {
            // Add data to the chart
            ecgChart.data.labels.push(timestamp); // Store raw timestamp
            ecgChart.data.datasets[0].data.push(ecg);

            // Adjust x-axis range to show the latest 20 data points
            const visibleRange = 20; // Number of points visible at once
            const totalPoints = ecgChart.data.labels.length;
            const start = totalPoints > visibleRange ? totalPoints - visibleRange : 0;
            ecgChart.options.scales.x.min = ecgChart.data.labels[start];
            ecgChart.options.scales.x.max = ecgChart.data.labels[totalPoints - 1];

            // Update the chart
            ecgChart.update();

            // Fetch the next data point after a short delay
            setTimeout(fetchData, 200); // Adjust the delay if needed
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setTimeout(fetchData, 1000); // Retry after 1 second on failure
        });
}

// Start fetching data
fetchData();

// Full-screen toggle functionality
document.getElementById('toggleFullScreen').addEventListener('click', () => {
    const chartContainer = document.getElementById('ecgChartContainer');
    chartContainer.classList.toggle('fullscreen');
});
