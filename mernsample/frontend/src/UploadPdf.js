import React, { useState, useRef } from 'react';
import axios from 'axios';

function UploadPdf() {
  const [file, setFile] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);

  // Ref to access the file input element
  const fileInputRef = useRef(null);

  const collectionOptions = ['JEE', 'CET', 'ME', 'DSE'];

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleCollectionChange = (e) => setCollectionName(e.target.value);

  const handleUpload = async () => {
    if (!file || !collectionName) {
      alert('Please select a file and enter a collection name.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('collectionName', collectionName);

    setUploading(true);
    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResponse(res.data);

      // Clear selections after successful upload
      setFile(null);
      setCollectionName('');

      // Reset the file input field
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      setResponse({ message: 'Error uploading or processing the file.' });
    }
    setUploading(false);
  };

  return (
    <div className="container">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
      <div className="form-box">
        <h2>Upload PDF File</h2>
        <div className="input-group">
          <label>Select Collection<span style={{ color: 'red' }}>*</span></label>
          <select value={collectionName} onChange={handleCollectionChange}>
            <option value="">Select Collection</option>
            {collectionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Upload PDF<span style={{ color: 'red' }}>*</span></label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef} // Attach the ref to the file input
          />
        </div>

        <button className="btn" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {response && (
          <div className="response-message">
            <h3>{response.message}</h3>
            {response.csvFilePath && (
              <p>
                Generated CSV Path:{' '}
                <a href={`http://localhost:5000/${response.csvFilePath}`} download>
                  Download CSV
                </a>
              </p>
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }

        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-image: url('bgimg.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          overflow: hidden;
        }

        body::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('bgimg.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(5px);
          opacity: 0.7;
          z-index: -1;
        }

        .container {
          width: 100%;
          max-width: 600px;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }

        .form-box {
          text-align: center;
        }

        .form-box h2 {
          margin-bottom: 20px;
          color: #333;
          font-weight: 600;
        }

        .input-group {
          margin-bottom: 15px;
          text-align: left;
        }

        .input-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #444;
        }

        .input-group select,
        .input-group input[type='file'] {
          width: 100%;
          padding: 10px;
          border: 2px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
          background: transparent;
          outline: none;
          transition: border-color 0.3s;
        }

        .input-group select:focus,
        .input-group input[type='file']:focus {
          border-color: #667eea;
        }

        .btn {
          width: 100%;
          padding: 12px;
          background: #667eea;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 18px;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn:hover {
          background: #5643a0;
        }

        .btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .response-message {
          margin-top: 20px;
          text-align: center;
        }

        .response-message h3 {
          color: #333;
        }

        .response-message a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.3s;
        }

        .response-message a:hover {
          color: #5643a0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            width: 90%;
            padding: 15px;
          }

          .input-group select,
          .input-group input[type='file'] {
            font-size: 14px;
          }

          .btn {
            font-size: 16px;
            padding: 10px;
          }
        }

        @media (max-width: 480px) {
          .container {
            width: 95%;
          }

          .form-box h2 {
            font-size: 22px;
          }

          .input-group select,
          .input-group input[type='file'] {
            font-size: 14px;
          }

          .btn {
            font-size: 16px;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default UploadPdf;