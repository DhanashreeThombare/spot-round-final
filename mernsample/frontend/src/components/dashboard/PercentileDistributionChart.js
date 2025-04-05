import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  Card, CardHeader, Box, CardContent, Typography, 
  CircularProgress, useTheme, Alert 
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const PercentileDistributionChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/percentile-distribution');
        
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
    
        const result = await response.json();
        
        // Validate response structure
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid data format received');
        }
    
        setData(result.data);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const chartData = {
    labels: data.map(item => item.range),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: [
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.success.main,
          theme.palette.primary.main,
          theme.palette.secondary.main,
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '70%',
  };

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
        title="Percentile Distribution (CET)"
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
        height: '400px', // Fixed height for consistent sizing
        position: 'relative'
      }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error loading data: {error}
          </Alert>
        ) : data.length === 0 ? (
          <Typography variant="body1">
            No percentile data available
          </Typography>
        ) : (
          <Box sx={{ height: '100%' }}>
            <Doughnut data={chartData} options={options} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PercentileDistributionChart;


// PercentileDistributionChart.js
// import React, { useState, useEffect } from 'react';
// import { Doughnut } from 'react-chartjs-2';
// import { Card, CardContent, Typography, CircularProgress, useTheme } from '@mui/material';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// // Register ChartJS components
// ChartJS.register(ArcElement, Tooltip, Legend);

// const PercentileDistributionChart = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const theme = useTheme();

//   useEffect(() => {
//     const fetchData = async () => {
//         try {
//           setLoading(true);
//           const response = await fetch('http://localhost:5000/percentile-distribution');
          
//           if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
//           const result = await response.json();
          
//           // Validate response structure
//           if (!result.success || !Array.isArray(result.data)) {
//             throw new Error('Invalid data format received');
//           }
      
//           setData(result.data); // Only use the 'data' array
//         } catch (err) {
//           setError(err.message);
//           setData([]); // Reset on error
//         } finally {
//           setLoading(false);
//         }
//       };

//     fetchData();
//   }, []);

//   // Prepare chart data
//   const chartData = {
//     labels: data.map(item => item.range),
//     datasets: [
//       {
//         data: data.map(item => item.count),
//         backgroundColor: [
//           theme.palette.error.main,
//           theme.palette.warning.main,
//           theme.palette.info.main,
//           theme.palette.success.main,
//         ],
//         borderColor: theme.palette.background.paper,
//         borderWidth: 2,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'bottom',
//       },
//       tooltip: {
//         callbacks: {
//           label: function(context) {
//             const total = context.dataset.data.reduce((a, b) => a + b, 0);
//             const value = context.raw;
//             const percentage = Math.round((value / total) * 100);
//             return `${context.label}: ${value} (${percentage}%)`;
//           }
//         }
//       },
//     },
//     cutout: '70%',
//   };

//   return (
//     <div style={{ 
//         height: '300px',
//         width: '100%',
//         position: 'relative',
//         minHeight: '300px'
//       }}>
//     <Card sx={{ height: '100%' }}>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>
//           Percentile Distribution (CET)
//         </Typography>
        
//         {loading ? (
//           <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
//             <CircularProgress />
//           </div>
//         ) : error ? (
//           <Typography color="error" variant="body2">
//             Error loading data: {error}
//           </Typography>
//         ) : data.length === 0 ? (
//           <Typography variant="body2">
//             No percentile data available in CET collection
//           </Typography>
//         ) : (
//           <div style={{ height: '400px' }}>
//             <Doughnut data={chartData} options={options} />
//           </div>
//         )}
//       </CardContent>
//     </Card>
//     </div>
//   );
// };

// export default PercentileDistributionChart;