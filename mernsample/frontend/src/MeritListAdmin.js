import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MeritListAdmin = () => {
  const [meritList, setMeritList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [examType, setExamType] = useState('JEE'); // Default exam type
  const [availableColumns, setAvailableColumns] = useState([]); // All available columns
  const [selectedColumns, setSelectedColumns] = useState([]); // Columns selected by the user

  // Wrap fetchMeritList in useCallback
  const fetchMeritList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/get-merit-list', { examType });
      console.log('API Response:', response); // Log the response for debugging

      if (response.data && response.data.meritListData) {
        setMeritList(response.data.meritListData);

        // Extract available columns from the first record
        if (response.data.meritListData.length > 0) {
          const columns = Object.keys(response.data.meritListData[0]);
          setAvailableColumns(columns);
          setSelectedColumns(columns); // Default to all columns
        }
      } else {
        console.error('Invalid API response:', response.data);
        setError('Invalid data received from the server.');
      }
    } catch (err) {
      console.error('Error fetching merit list:', err);
      setError('Error fetching merit list data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [examType]); // Add examType as a dependency for useCallback

  useEffect(() => {
    fetchMeritList();
  }, [examType, fetchMeritList]); // Add fetchMeritList to the dependency array

  const handleColumnSelection = (column, isChecked) => {
    if (isChecked) {
      setSelectedColumns((prevSelectedColumns) => [...prevSelectedColumns, column]);
    } else {
      setSelectedColumns((prevSelectedColumns) =>
        prevSelectedColumns.filter((col) => col !== column)
      );
    }
  };

  const handleDownloadMeritList = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/download-merit-list',
        { examType, selectedColumns },
        { responseType: 'blob' } // Important for file downloads
      );

      // Create a blob URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${examType}_merit_list.csv`); // Set the file name
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading merit list:', error);
      alert('Failed to download merit list. Please try again.');
    }
  };

  // Inline Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '2rem',
      fontFamily: "'Poppins', sans-serif",
    },
    heading: {
      fontSize: '2rem',
      fontWeight: '600',
      color: '#333',
      marginBottom: '1.5rem',
    },
    examTypeContainer: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '10px',
      boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem',
    },
    examTypeLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#444',
      marginBottom: '0.5rem',
    },
    examTypeSelect: {
      width: '100%',
      padding: '10px 0',
      border: 'none',
      borderBottom: '2px solid #ccc',
      fontSize: '12px',
      background: 'transparent',
      outline: 'none',
      transition: 'border-color 0.3s',
    },
    columnSelectionContainer: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '10px',
      boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem',
      fontSize: '12px',
    },
    columnGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
    },
    columnCheckboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    downloadButton: {
      width: '30%',
      padding: '12px',
      background: '#667eea',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: '0.3s',
      marginBottom: '1.5rem',
      marginLeft: '35%',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
      overflow: 'auto',
    },
    tableHeading: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#333',
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
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
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      fontSize: '12px', // Smaller font size for headers
    },
    tableRow: {
      transition: 'background-color 0.2s',
    },
    tableCell: {
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      fontSize: '12px', // Smaller font size for table data
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '16rem',
    },
    spinner: {
      width: '3rem',
      height: '3rem',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
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
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      color: '#6b7280',
    },
  };

  return (
    <div style={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={styles.heading}>Merit List Administration</h1>

        {/* Exam Type Selection */}
        <div style={styles.examTypeContainer}>
          <label style={styles.examTypeLabel}>Select Exam Type:</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            style={styles.examTypeSelect}
          >
            <option value="JEE">JEE</option>
            <option value="CET">CET</option>
            <option value="ME">ME</option>
            <option value="DSE">DSE</option>
          </select>
        </div>

        {/* Column Selection */}
        {availableColumns.length > 0 && (
          <div style={styles.columnSelectionContainer}>
            <label style={styles.examTypeLabel}>Select Columns to Display:</label>
            <div style={styles.columnGrid}>
              {availableColumns.map((column) => (
                <label key={column} style={styles.columnCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={(e) => handleColumnSelection(column, e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <span>{column}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Merit List Table */}
        {loading ? (
          <div style={styles.loadingSpinner}>
            <div style={styles.spinner}></div>
          </div>
        ) : error ? (
          <div style={styles.errorMessage}>{error}</div>
        ) : meritList.length > 0 ? (
          <div style={styles.tableContainer}>
            <h2 style={styles.tableHeading}>{examType} Merit List</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  {selectedColumns.map((header, index) => (
                    <th key={index} style={styles.tableHeader}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meritList.map((applicant, index) => (
                  <tr key={index} style={styles.tableRow}>
                    {selectedColumns.map((header, idx) => {
                      const value = applicant[header];
                      let displayValue = 'N/A';

                      if (typeof value === 'object' && value !== null) {
                        // Convert object to string
                        displayValue = JSON.stringify(value);
                      } else if (value !== undefined && value !== null) {
                        // Use the value directly if it's not an object
                        displayValue = value;
                      }

                      return (
                        <td key={idx} style={styles.tableCell}>
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.noRecords}>No records found for {examType}.</div>
        )}<br></br>
        {/* Download Button */}
        <button
          onClick={handleDownloadMeritList}
          style={styles.downloadButton}
        >
          Download Merit List
        </button>
      </div>
    </div>
  );
};

export default MeritListAdmin;