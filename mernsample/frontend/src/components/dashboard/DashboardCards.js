import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, CircularProgress, Button, 
  Container, Box
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import GenderDistributionChart from './GenderDistributionChart';
import PercentileDistributionChart from './PercentileDistributionChart';

const DashboardCards = ({ totalSeats }) => {
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://spot-round-final.onrender.com/count-registered-students');
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      const count = data.studentCount || 0;
      setStudentsCount(count);
      
    } catch (err) {
      console.error('Error fetching student count:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const remainingSeats = totalSeats - studentsCount;
  const filledPercentage = totalSeats > 0 
    ? Math.round((studentsCount / totalSeats) * 100)
    : 0;

  return (
    <>
      <Grid container spacing={3}>
        {/* Registered Students Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#4caf50', color: 'white', minHeight: 160 }}>
            <CardContent>
              <Typography variant="h6">Registered Students</Typography>
              {loading ? (
                <CircularProgress color="inherit" />
              ) : apiError ? (
                <>
                  <Typography variant="body2" color="error">
                    Error: {apiError}
                  </Typography>
                  <Typography variant="h6">
                    Last known: {studentsCount}
                  </Typography>
                </>
              ) : (
                <Typography variant="h3">{studentsCount}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Remaining Seats Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f44336', color: 'white', minHeight: 160 }}>
            <CardContent>
              <Typography variant="h6">Remaining Seats</Typography>
              {loading ? (
                <CircularProgress color="inherit" />
              ) : (
                <Typography variant="h3">{remainingSeats}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Total Seats Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#2196f3', color: 'white', minHeight: 160 }}>
            <CardContent>
              <Typography variant="h6">Total Seats</Typography>
              <Typography variant="h3">{totalSeats}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Filled Percentage Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ff9800', color: 'white', minHeight: 160 }}>
            <CardContent>
              <Typography variant="h6">Filled Percentage</Typography>
              {loading ? (
                <CircularProgress color="inherit" />
              ) : (
                <Typography variant="h3">{filledPercentage}%</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={fetchData}
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? 'Refreshing...' : 'Refresh Data'}
      </Button>

      <Container maxWidth="100%" sx={{ 
        py: 4,
        '& .MuiGrid-item': {
          display: 'flex'
        }
      }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <GenderDistributionChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <PercentileDistributionChart />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};


// return (
//     <Container maxWidth="xl" sx={{ py: 3 }}>
//       {/* Keep your 4 cards exactly as they were */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {/* Registered Students Card */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card sx={{ bgcolor: '#4caf50', color: 'white', minHeight: 160 }}>
//             <CardContent>
//               <Typography variant="h6">Registered Students</Typography>
//               {loading ? (
//                 <CircularProgress color="inherit" />
//               ) : apiError ? (
//                 <>
//                   <Typography variant="body2" color="error">
//                     Error: {apiError}
//                   </Typography>
//                   <Typography variant="h6">
//                     Last known: {studentsCount}
//                   </Typography>
//                 </>
//               ) : (
//                 <Typography variant="h3">{studentsCount}</Typography>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Remaining Seats Card */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card sx={{ bgcolor: '#f44336', color: 'white', minHeight: 160 }}>
//             <CardContent>
//               <Typography variant="h6">Remaining Seats</Typography>
//               {loading ? (
//                 <CircularProgress color="inherit" />
//               ) : (
//                 <Typography variant="h3">{remainingSeats}</Typography>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Total Seats Card */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card sx={{ bgcolor: '#2196f3', color: 'white', minHeight: 160 }}>
//             <CardContent>
//               <Typography variant="h6">Total Seats</Typography>
//               <Typography variant="h3">{totalSeats}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Filled Percentage Card */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card sx={{ bgcolor: '#ff9800', color: 'white', minHeight: 160 }}>
//             <CardContent>
//               <Typography variant="h6">Filled Percentage</Typography>
//               {loading ? (
//                 <CircularProgress color="inherit" />
//               ) : (
//                 <Typography variant="h3">{filledPercentage}%</Typography>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Updated Charts Section - Only this part is modified */}
//       <Grid container spacing={3}>
//         {/* Gender Distribution Chart */}
//         <Grid item xs={12} md={6}>
//           <Card sx={{ 
//             height: '100%',
//             display: 'flex',
//             flexDirection: 'column',
//             minHeight: '400px' // Added minimum height
//           }}>
//             <CardHeader 
//               title="Gender Distribution (CET)"
//               sx={{ 
//                 bgcolor: '#f5f5f5',
//                 borderBottom: '1px solid #e0e0e0',
//                 py: 1.5
//               }}
//               titleTypographyProps={{ 
//                 variant: 'subtitle1',
//                 fontWeight: 'bold'
//               }}
//             />
//             <CardContent sx={{ 
//               flex: 1,
//               padding: 0,
//               height: 'calc(100% - 60px)' // Adjust based on header height
//             }}>
//               <div style={{ 
//                 width: '100%', 
//                 height: '100%',
//                 minHeight: '350px',
//                 padding: '16px'
//               }}>
//                 <GenderDistributionChart />
//               </div>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Percentile Distribution Chart */}
//         <Grid item xs={12} md={6}>
//           <Card sx={{ 
//             height: '100%',
//             display: 'flex',
//             flexDirection: 'column',
//             minHeight: '400px' // Added minimum height
//           }}>
//             <CardHeader 
//               title="Percentile Ranges (CET)"
//               sx={{ 
//                 bgcolor: '#f5f5f5',
//                 borderBottom: '1px solid #e0e0e0',
//                 py: 1.5
//               }}
//               titleTypographyProps={{ 
//                 variant: 'subtitle1',
//                 fontWeight: 'bold'
//               }}
//             />
//             <CardContent sx={{ 
//               flex: 1,
//               padding: 0,
//               height: 'calc(100% - 60px)' // Adjust based on header height
//             }}>
//               <div style={{ 
//                 width: '100%', 
//                 height: '100%',
//                 minHeight: '350px',
//                 padding: '16px'
//               }}>
//                 <PercentileDistributionChart />
//               </div>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Keep your existing refresh button */}
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//         <Button
//           variant="contained"
//           startIcon={<RefreshIcon />}
//           onClick={fetchData}
//           disabled={loading}
//           sx={{
//             px: 4,
//             py: 1.5,
//             borderRadius: 2,
//             fontWeight: 600
//           }}
//         >
//           {loading ? 'Refreshing...' : 'Refresh Data'}
//         </Button>
//       </Box>
//     </Container>
//   );
// };


export default DashboardCards;
