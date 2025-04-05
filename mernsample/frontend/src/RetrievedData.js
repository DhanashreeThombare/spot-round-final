import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function RetrievedData() {
  const [retrievedData, setRetrievedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0); // Retry counter
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationId, name } = location.state || {};

  useEffect(() => {
    if (applicationId && name) {
      console.log('Fetching data for:', { applicationId, name }); // Debugging log
      fetchApplicationData(applicationId, name);
    } else {
      console.error('Application ID or Name is missing.'); // Debugging log
      setError('Application ID or Name is missing.');
    }
  }, [applicationId, name, retryCount]); // Retry when retryCount changes

  const fetchApplicationData = async (applicationId, name) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Sending request to backend...'); // Debugging log
      const res = await axios.post('https://spot-round-final.onrender.com/get-application', {
        applicationId,
        name,
      });

      console.log('Response from backend:', res.data); // Debugging log

      if (res.data && res.data.length > 0) {
        setRetrievedData(res.data);
      } else {
        setError('No data found for the given application.');
        setRetrievedData([]);
      }
    } catch (error) {
      console.error('Error fetching application data:', error); // Debugging log
      setError('Error fetching application data. Please try again.');

      // Retry after 3 seconds
      if (retryCount < 3) {
        console.log(`Retrying in 3 seconds... (Attempt ${retryCount + 1})`); // Debugging log
        setTimeout(() => {
          setRetryCount(retryCount + 1); // Increment retry count
        }, 3000);
      } else {
        console.error('Max retries reached.'); // Debugging log
        setError('Failed to fetch data after multiple attempts. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    // Redirect to the success page without any additional logic
    navigate('/success', { state: { applicationId, name } });
  };

  // Inline Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '1rem',
      fontFamily: "'Poppins', sans-serif",
    },
    heading: {
      fontSize: '1.5rem', // Smaller font size for mobile
      fontWeight: '600',
      color: '#333',
      marginBottom: '1rem',
      textAlign: 'center',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
      padding: '1rem',
      marginBottom: '1rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      color: '#6b7280',
      fontWeight: '500',
      textTransform: 'uppercase',
      padding: '0.5rem 1rem', // Smaller padding for mobile
      textAlign: 'left',
      fontSize: '12px',
    },
    tableRow: {
      transition: 'background-color 0.2s',
    },
    tableCell: {
      padding: '0.5rem 1rem', // Smaller padding for mobile
      textAlign: 'left',
      fontSize: '12px',
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '16rem',
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      border: '1px solid #ef4444',
      color: '#dc2626',
      padding: '1rem',
      borderRadius: '0.375rem',
      textAlign: 'center',
    },
    noRecords: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      color: '#6b7280',
    },
    cardContainer: {
      display: 'none', // Hide by default, shown only on small screens
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '1rem',
      marginBottom: '1rem',
    },
    cardRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    cardKey: {
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'capitalize',
      fontSize: '12px', // Smaller font size for mobile
    },
    cardValue: {
      color: '#333',
      fontSize: '12px', // Smaller font size for mobile
    },
    submitButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      marginTop: '1rem',
      width: '100%',
      maxWidth: '200px',
      margin: '0 auto',
      display: 'block',
    },
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

          {/* Submit Button */}
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
