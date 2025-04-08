import React, { useState } from 'react'; // Add useState import here
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ApplicationForm from './ApplicationForm';
import RetrievedData from './RetrievedData';
import UploadPdf from './UploadPdf';
import MeritListAdmin from './MeritListAdmin';
import DashboardPage from './Pages/DashboardPage';
import Login from './Login';
import Signup from './Signup';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
<BrowserRouter>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ApplicationForm />} />
          <Route path="/retrieved-data" element={<RetrievedData />} />
          <Route path="/upload-pdf" element={<UploadPdf />} />
          <Route path="/merit-list-admin" element={<MeritListAdmin />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/login" 
            element={<Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <DashboardPage />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
</BrowserRouter>
  );
}

export default App;
