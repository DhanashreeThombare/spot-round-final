import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Card, CardHeader,Box, CardContent, Typography, 
  CircularProgress, useTheme 
} from '@mui/material';

const GenderDistributionChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/gender-distribution', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `Server responded with ${response.status}`
          );
        }
  
        const result = await response.json();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message.includes('Failed to fetch') 
          ? 'Network error - check backend connection'
          : err.message
        );
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  return (
    <Card sx={{ 
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 3,
      borderRadius: 2,
      '&:hover': {
        boxShadow: 6,
        transition: '0.3s'
      }
    }}>
      <CardHeader 
        title="Gender Distribution (CET)"
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        sx={{ 
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          padding: 2
        }}
      />
      <CardContent sx={{ 
        flexGrow: 1,
        padding: 3,
        height: '400px' // Fixed height for consistent sizing
      }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body1">
            Error loading data: {error}
          </Typography>
        ) : data.length === 0 ? (
          <Typography variant="body1">
            No gender data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="horizontal" // Optional: switch to horizontal bars if preferred
            >
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis 
                type="number"
                domain={[0, 'dataMax+10']} // Ensures axis starts at 0
              />
              <XAxis 
                dataKey="gender" 
                type="category"
                width={80}
              />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Students"
                fill={theme.palette.primary.main}
                radius={[0, 4, 4, 0]} // Rounded corners on right side only
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default GenderDistributionChart;

// GenderDistributionChart.js
// import React, { useState, useEffect } from 'react';
// import { 
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, 
//   Tooltip, Legend, ResponsiveContainer 
// } from 'recharts';
// import { 
//   Card, CardContent, Typography, 
//   CircularProgress, useTheme 
// } from '@mui/material';

// const GenderDistributionChart = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const theme = useTheme();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch('http://localhost:5000/gender-distribution', {
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           }
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(
//             errorData.message || 
//             `Server responded with ${response.status}`
//           );
//         }
  
//         const result = await response.json();
//         setData(Array.isArray(result) ? result : []);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError(err.message.includes('Failed to fetch') 
//           ? 'Network error - check backend connection'
//           : err.message
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchData();
//   }, []);

//   return (
//     <div style={{ 
//         height: '300px',
//         width: '100%',
//         position: 'relative',
//         minHeight: '300px'
//       }}>
//     <Card sx={{ height: '100%', p: 2 }}>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>
//           Gender Distribution (CET)
//         </Typography>
        
//         {loading ? (
//           <div style={{ display: 'flex', justifyContent: 'center' }}>
//             <CircularProgress />
//           </div>
//         ) : error ? (
//           <Typography color="error">
//             Error loading data: {error}
//           </Typography>
//         ) : data.length === 0 ? (
//           <Typography>
//             No gender data available in CET collection
//           </Typography>
//         ) : (
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart
//               data={data}
//               margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis 
//                 dataKey="gender" 
//                 label={{ value: 'Gender', position: 'insideBottom', offset: -5 }}
//               />
//               <YAxis 
//                 label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
//               />
//               <Tooltip />
//               <Legend />
//               <Bar 
//                 dataKey="count" 
//                 name="Students"
//                 fill={theme.palette.primary.main}
//                 radius={[4, 4, 0, 0]}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         )}
//       </CardContent>
//     </Card>
//     </div>
//   );
// };

// export default GenderDistributionChart;