import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function RetrievedData() {
  const [retrievedData, setRetrievedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationId, name } = location.state || {};

  const fetchApplicationData = useCallback(async (applicationId, name) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Sending request to backend...');
      const res = await axios.post('https://spot-round-final.onrender.com/get-application', {
        applicationId,
        name,
      });

      console.log('Response from backend:', res.data);

      if (res.data && res.data.length > 0) {
        setRetrievedData(res.data);
      } else {
        setError('No data found for the given application.');
        setRetrievedData([]);
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
      setError('Error fetching application data. Please try again.');

      if (retryCount < 3) {
        console.log(`Retrying in 3 seconds... (Attempt ${retryCount + 1})`);
        setTimeout(() => {
          setRetryCount(retryCount + 1);
        }, 3000);
      } else {
        console.error('Max retries reached.');
        setError('Failed to fetch data after multiple attempts. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    if (applicationId && name) {
      console.log('Fetching data for:', { applicationId, name });
      fetchApplicationData(applicationId, name);
    } else {
      console.error('Application ID or Name is missing.');
      setError('Application ID or Name is missing.');
    }
  }, [applicationId, name, fetchApplicationData]);

  const handleSubmit = () => {
    navigate('/success', { state: { applicationId, name } });
  };

  // Inline Styles (unchanged from your original)
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '1rem',
      fontFamily: "'Poppins', sans-serif",
    },
    // ... (keep all your existing style definitions exactly as they were)
  };

  return (
    <div style={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
      <h1 style={styles.heading}>Retrieved Application Data</h1>

      {loading ? (
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
        </div>
      ) : error ? (
        <div style={styles.errorMessage}>{error}</div>
      ) : retrievedData.length > 0 ? (
        <div>
          {retrievedData.map((data, index) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginBottom: '1rem', textAlign: 'center' }}>
                {data.examType} Merit List
              </h2>

              {/* Table for Desktop */}
              <div style={{ display: { xs: 'none', sm: 'block' } }}>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <tbody>
                      {Object.entries(data).map(([key, value], idx) => (
                        <tr key={idx} style={styles.tableRow}>
                          <td style={{ ...styles.tableCell, backgroundColor: '#f9fafb', fontWeight: '500', textTransform: 'capitalize' }}>
                            {key.replace(/\r/g, '')}
                          </td>
                          <td style={styles.tableCell}>
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards for Mobile */}
              <div style={{ display: { xs: 'block', sm: 'none' } }}>
                <div style={styles.cardContainer}>
                  {Object.entries(data).map(([key, value], idx) => (
                    <div key={idx} style={styles.card}>
                      <div style={styles.cardRow}>
                        <div style={styles.cardKey}>{key.replace(/\r/g, '')}</div>
                        <div style={styles.cardValue}>
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button style={styles.submitButton} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      ) : (
        <div style={styles.noRecords}>No data found.</div>
      )}
    </div>
  );
}

export default RetrievedData;
