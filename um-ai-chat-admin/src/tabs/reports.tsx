<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reports Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background-color: #2D2D2D;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .sidebar {
            width: 250px;
            background-color: #3C3C3C;
        }
        .menu-item {
            padding: 12px 20px;
            border-bottom: 1px solid #4A4A4A;
            cursor: pointer;
        }
        .menu-item:hover {
            background-color: #4A4A4A;
        }
        .active {
            background-color: #4A4A4A;
            border-left: 4px solid #EF4444;
        }
        .report-item {
            border-bottom: 1px solid #4A4A4A;
            padding: 16px 0;
        }
        .report-item:last-child {
            border-bottom: none;
        }
    </style>
</head>
<body class="flex h-screen">
    <!-- Sidebar Navigation -->
    <div class="sidebar">
        <div class="p-5 border-b border-gray-600">
            <h1 class="text-xl font-bold">ask VC</h1>
        </div>
        <div class="py-2">
            <div class="menu-item">Dashboard</div>
            <div class="menu-item">Rules</div>
            <div class="menu-item">Professor</div>
            <div class="menu-item">Rooms</div>
            <div class="menu-item">Offices</div>
            <div class="menu-item">Departments</div>
            <div class="menu-item active">Reports</div>
            <div class="menu-item">Logs</div>
            <div class="menu-item">Logout</div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-8">
        <div class="bg-[#3C3C3C] w-full max-w-4xl h-[800px] p-6 rounded-lg">
            <div class="flex justify-center mb-6">
                <h1 class="text-white text-2xl font-bold">Reports</h1>
            </div>

            <!-- Reports Container -->
            <div class="w-full h-[600px] bg-[#2A2A2A] p-6 rounded-lg overflow-y-auto">
                <div class="text-gray-300 space-y-4">
                    <!-- Report Items -->
                    <div class="report-item">
                        <p class="font-semibold text-red-400">Room Utilization Report - September 2025</p>
                        <p class="text-sm text-gray-400">Generated on: 2025-09-19 10:30 AM</p>
                    </div>
                    
                    <div class="report-item">
                        <p class="font-semibold text-blue-400">Professor Schedule Conflict Report</p>
                        <p class="text-sm text-gray-400">Generated on: 2025-09-18 3:45 PM</p>
                    </div>
                    
                    <div class="report-item">
                        <p class="font-semibold text-green-400">Department Allocation Summary</p>
                        <p class="text-sm text-gray-400">Generated on: 2025-09-17 9:15 AM</p>
                    </div>
                    
                    <div class="report-item">
                        <p class="font-semibold text-yellow-400">Office Space Utilization</p>
                        <p class="text-sm text-gray-400">Generated on: 2025-09-16 2:20 PM</p>
                    </div>
                    
                    <div class="report-item">
                        <p class="font-semibold text-purple-400">Rule Compliance Audit</p>
                        <p class="text-sm text-gray-400">Generated on: 2025-09-15 11:05 AM</p>
                    </div>
                    
                    <div class="report-item">
                        <p class="font-semibold text-pink-400">Weekly Activity Summary</p>
                        <p class="text-sm text-gray-400">Generated on: 2025-09-14 4:30 PM</p>
                    </div>
                    
                    <div class="report-item">
                        <p class="font-semibold text-indigo-400">Resource Allocation Report</p>
                        <p class="text-sm text-gray-400">Generated on: 2025-09-13 1:15 PM</p>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 flex space-x-4">
                <button class="w-[180px] h-[45px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200">
                    Generate Report
                </button>
                <button class="w-[180px] h-[45px] bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition duration-200">
                    Export
                </button>
                <button class="w-[180px] h-[45px] bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition duration-200">
                    Print
                </button>
            </div>
        </div>
        
        <!-- Recent Activity Footer -->
        <div class="mt-6 text-gray-400">
            <p>admin Kenneth IS login: this week</p>
        </div>
    </div>
</body>
</html>
