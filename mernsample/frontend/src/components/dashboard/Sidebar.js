import React, { useState } from 'react';
import { 
  FaBars, 
  FaUserCog,        // For Set Total Seats (admin settings)
  FaFilePdf,        // For PDF Conversion
  FaListOl,         // For Merit List
  FaFilter,         // For Filtered Merit List
  FaChartBar,       // For Charts
  FaSignOutAlt      // For Logout (already in your code)
} from 'react-icons/fa';
import styled from 'styled-components';
import SetTotalSeatsPopup from './SetTotalSeatsPopup'; // Import the popup component

// Styled components
const SidebarContainer = styled.div`
  width: ${({ isOpen }) => (isOpen ? '250px' : '60px')};
  height: 100vh; /* Full viewport height */
  background-color: #2c3e50;
  color: #ecf0f1;
  transition: width 0.3s ease;
  overflow: hidden;
  @media (max-width: 768px) {
    width: ${({ isOpen }) => (isOpen ? '250px' : '0')};
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  justify-content: ${({ isOpen }) => (isOpen ? 'space-between' : 'center')};
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #34495e;
  }
`;

const MenuIcon = styled.span`
  margin-right: ${({ isOpen }) => (isOpen ? '10px' : '0')};
`;

const MenuText = styled.span`
  display: ${({ isOpen }) => (isOpen ? 'inline' : 'none')};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #ecf0f1;
  cursor: pointer;
  font-size: 20px;
`;


const Sidebar = ({ onSetTotalSeats }) => {  // Make sure to destructure the prop here
  const [isOpen, setIsOpen] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (totalSeats) => {
    if (onSetTotalSeats) {  // Add this check for safety
      onSetTotalSeats(totalSeats);
    }
    setPopupOpen(false);
  };
  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader isOpen={isOpen}>
        {isOpen && <h3>Admin Dashboard</h3>}
        <ToggleButton onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>
      </SidebarHeader>
      <SidebarMenu>
      {/* Set Total Seats */}
      <MenuItem onClick={() => setPopupOpen(true)}>
        <MenuIcon isOpen={isOpen}>
          <FaUserCog />
        </MenuIcon>
        <MenuText isOpen={isOpen}>Set Total Seats</MenuText>
      </MenuItem>

      {/* PDF Conversion */}
      <MenuItem>
        <MenuIcon isOpen={isOpen}>
          <FaFilePdf />
        </MenuIcon>
        <MenuText isOpen={isOpen}>PDF Conversion</MenuText>
      </MenuItem>

      {/* Merit List */}
      <MenuItem>
        <MenuIcon isOpen={isOpen}>
          <FaListOl />
        </MenuIcon>
        <MenuText isOpen={isOpen}>Merit List</MenuText>
      </MenuItem>

      {/* Filtered Merit List */}
      <MenuItem>
        <MenuIcon isOpen={isOpen}>
          <FaFilter />
        </MenuIcon>
        <MenuText isOpen={isOpen}>Filtered Merit List</MenuText>
      </MenuItem>

      {/* Charts */}
      <MenuItem>
        <MenuIcon isOpen={isOpen}>
          <FaChartBar />
        </MenuIcon>
        <MenuText isOpen={isOpen}>Charts</MenuText>
      </MenuItem>

      {/* Logout */}
      <MenuItem>
        <MenuIcon isOpen={isOpen}>
          <FaSignOutAlt />
        </MenuIcon>
        <MenuText isOpen={isOpen}>Logout</MenuText>
      </MenuItem>
    </SidebarMenu>

      {/* Popup for setting total seats */}
      <SetTotalSeatsPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSubmit={handleSubmit}
      />
    </SidebarContainer>
  );
};

export default Sidebar;