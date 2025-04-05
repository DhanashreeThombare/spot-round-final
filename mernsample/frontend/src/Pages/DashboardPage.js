import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import styled from 'styled-components';
import DashboardCards from '../components/dashboard/DashboardCards';
import { Typography } from '@mui/material';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  background-color: #ecf0f1;
  height: 100%;
`;

const DashboardPage = () => {
  const [totalSeats, setTotalSeats] = useState(1000);

  const handleSetTotalSeats = (newTotalSeats) => {
    setTotalSeats(newTotalSeats);
    // Add API call here if needed
  };

  return (
    <DashboardContainer>
      <Sidebar onSetTotalSeats={handleSetTotalSeats} />
      <MainContent>
        <Typography variant="h4" gutterBottom>
          Welcome to the Admin Dashboard
        </Typography>
        <DashboardCards totalSeats={totalSeats} />
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardPage;