
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import MainDashboard from "./maindashboard";
import Dashboard from "./tabs/dashboard";
import Rules from "./tabs/info-rules";
import Rooms from "./tabs/rooms";
import Employee from "./tabs/employee";
import Buildings from "./tabs/buildings";
import Offices from "./tabs/offices"
import Departments from "./tabs/departments";
import Reports from "./tabs/reports";
import Logs from "./tabs/logs";
import Announcement from "./tabs/announcement";
import FeedbackTab from "./tabs/feedback";
import Signup from "./signup";

export default function App() {
  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<MainDashboard />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="Rules" element={<Rules/>}/>
                    <Route path="Employee" element={<Employee/>}/>
                    <Route path="Buildings" element={<Buildings/>}/>
                    <Route path="Rooms" element={<Rooms/>}/>
                    <Route path="Offices" element={<Offices/>}/>
                    <Route path="Departments" element={<Departments/>}/>
                    <Route path="Reports" element={<Reports/>}/>
                    <Route path="Logs" element={<Logs/>}/>
                    <Route path="Announcement" element={<Announcement/>}/>
                    <Route path="Feedback" element={<FeedbackTab/>}/>

                </Route>
            </Routes>
        </BrowserRouter>
    </>
  );
}
