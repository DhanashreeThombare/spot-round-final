import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ApplicationForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    applicationId: '',
    name: '',
    contactNumber: '',
    preferredBranch: '',
  });

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const res = await axios.post('https://spot-round-final.onrender.com/generate-otp', { email });
      alert(res.data.message);
      setIsOtpSent(true);
    } catch (error) {
      alert('Error sending OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post('https://spot-round-final.onrender.com/verify-otp', { email, otp });
      alert(res.data.message);
      setIsVerified(true);
    } catch (error) {
      alert('Invalid or expired OTP.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://spot-round-final.onrender.com/submit-application', {
        ...formData,
        email,
      });
      alert(res.data.message);

      // Redirect to RetrievedData with form data
      navigate('/retrieved-data', { state: { applicationId: formData.applicationId, name: formData.name } });
    } catch (error) {
      alert('Error submitting application.');
    }
  };

  return (
    <div className="container">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet"></link>
      <style>
        {`
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
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
            margin-top: 10%;
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
            position: relative;
          }
          .input-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #444;
          }
          .input-group input {
            width: 100%;
            padding: 10px 0;
            border: none;
            border-bottom: 2px solid #ccc;
            font-size: 16px;
            background: transparent;
            outline: none;
            transition: border-color 0.3s;
          }
          .input-group input:focus {
            border-bottom: 2px solid #667eea;
          }
          .btn {
            width: 70%;
            padding: 12px;
            background: #667eea;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 18px;
            cursor: pointer;
            transition: 0.3s;
            margin-top:20px;
            margin-left:15%;
          }
          .btn:hover {
            background: #5643a0;
          }
        `}
      </style>

      <div className="form-box">
        <h2>Application Form</h2>
        {!isOtpSent ? (
          <div className="input-group">
            {/* <label>Email Address<span style={{ color: 'red' }}>*</span></label> */}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn" onClick={handleSendOtp}>Send OTP</button>
          </div>
        ) : !isVerified ? (
          <div className="input-group">
            <label>Enter OTP<span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className="btn" onClick={handleVerifyOtp}>Verify OTP</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Application ID<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="applicationId"
                value={formData.applicationId}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Candidate's Full Name<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Mobile Number<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Preferred Branch<span style={{ color: 'red' }}>*</span></label>
              <select name="preferredBranch" value={formData.preferredBranch} onChange={handleFormChange} required>
                <option value="">Select Branch</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="E & TC Engineering">E & TC Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="A & R Engineering">A & R Engineering</option>
              </select>
            </div>
            <button className="btn" type="submit">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ApplicationForm;
