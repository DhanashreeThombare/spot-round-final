import React, { useEffect, useState } from 'react';
import UserList from './UserList';

const Dashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <UserList users={users} />
    </div>
  );
};

export default Dashboard;