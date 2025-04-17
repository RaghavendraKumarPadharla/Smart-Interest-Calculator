<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Interest Calculator</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center px-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition duration-300">
        <h1 class="text-2xl font-bold text-center text-indigo-700 mb-6">Interest Calculator</h1>

        <form id="calculatorForm" class="space-y-4">
            <div>
                <label for="principal" class="block text-sm font-medium text-gray-700">Principal (₹)</label>
                <input type="number" id="principal" required class="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none">
            </div>

            <div>
                <label for="rate" class="block text-sm font-medium text-gray-700">Rate of Interest (%)</label>
                <input type="number" id="rate" required class="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none">
            </div>

            <div>
                <label for="time" class="block text-sm font-medium text-gray-700">Time (years)</label>
                <input type="number" id="time" required class="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none">
            </div>

            <div>
                <label for="interestType" class="block text-sm font-medium text-gray-700">Interest Type</label>
                <select id="interestType" class="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none">
                    <option value="simple">Simple Interest</option>
                    <option value="compound">Compound Interest</option>
                </select>
            </div>

            <div id="compoundingDiv" class="hidden">
                <label for="compounding" class="block text-sm font-medium text-gray-700">Compounding Frequency (per year)</label>
                <select id="compounding" class="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none">
                    <option value="1">Yearly</option>
                    <option value="2">Half-Yearly</option>
                    <option value="4">Quarterly</option>
                    <option value="12">Monthly</option>
                </select>
            </div>

            <div class="flex space-x-4 mt-4">
                <button type="submit" class="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition-transform transform hover:scale-105 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300">
                    Calculate
                </button>
                <button type="button" id="resetBtn" class="flex-1 bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 shadow-sm transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300">
                    Reset
                </button>
            </div>
        </form>

        <div id="results" class="hidden mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-inner">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <p class="text-gray-700 mb-2">Total Interest: <span id="totalInterest" class="font-bold text-indigo-600 text-lg"></span></p>
            <p class="text-gray-700">Total Amount: <span id="totalAmount" class="font-bold text-green-600 text-lg"></span></p>
        </div>

        <div class="mt-6">
            <canvas id="growthChart" height="100"></canvas>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const calculatorForm = document.getElementById('calculatorForm');
            const resetBtn = document.getElementById('resetBtn');
            const interestType = document.getElementById('interestType');
            const compoundingDiv = document.getElementById('compoundingDiv');
            const resultsDiv = document.getElementById('results');
            const growthChart = document.getElementById('growthChart');

            let chart = null;

            interestType.addEventListener('change', () => {
                compoundingDiv.classList.toggle('hidden', interestType.value === 'simple');
            });

            resetBtn.addEventListener('click', () => {
                calculatorForm.reset();
                resultsDiv.classList.add('hidden');
                compoundingDiv.classList.add('hidden');
                if (chart) {
                    chart.destroy();
                    chart = null;
                }
            });

            calculatorForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const principal = parseFloat(document.getElementById('principal').value);
                const rate = parseFloat(document.getElementById('rate').value);
                const time = parseFloat(document.getElementById('time').value);
                const type = interestType.value;
                const compounding = type === 'compound' ? parseInt(document.getElementById('compounding').value) : 1;

                if (isNaN(principal) || isNaN(rate) || isNaN(time) || principal <= 0 || rate <= 0 || time <= 0) {
                    alert('Please enter valid positive numbers for all fields');
                    return;
                }

                let totalInterest, totalAmount;

                if (type === 'simple') {
                    totalInterest = (principal * rate * time) / 100;
                    totalAmount = principal + totalInterest;
                } else {
                    const r = rate / 100;
                    totalAmount = principal * Math.pow(1 + (r / compounding), compounding * time);
                    totalInterest = totalAmount - principal;
                }

                document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
                document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
                resultsDiv.classList.remove('hidden');

                updateChart(principal, rate, time, type, compounding);
            });

            function formatCurrency(amount) {
                return new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(amount);
            }

            function updateChart(principal, rate, time, type, compounding) {
                const labels = [];
                const data = [];

                for (let year = 0; year <= time; year++) {
                    labels.push(`Year ${year}`);
                    if (type === 'simple') {
                        data.push(principal + (principal * rate * year) / 100);
                    } else {
                        data.push(principal * Math.pow(1 + (rate / 100 / compounding), compounding * year));
                    }
                }

                if (chart) {
                    chart.destroy();
                }

                const ctx = growthChart.getContext('2d');
                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Amount Growth',
                            data: data,
                            borderColor: '#4F46E5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        animation: {
                            duration: 1500,
                            easing: 'easeInOutQuad'
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return formatCurrency(context.raw);
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function (value) {
                                        return formatCurrency(value);
                                    }
                                }
                            }
                        }
                    }
                });
            }
        });
    </script>
</body>
</html>
