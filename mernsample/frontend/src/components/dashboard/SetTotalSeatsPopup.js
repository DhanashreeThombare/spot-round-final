import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const SetTotalSeatsPopup = ({ open, onClose, onSubmit }) => {
  const [totalSeats, setTotalSeats] = useState('');

  const handleSubmit = () => {
    const seats = parseInt(totalSeats);
    if (!isNaN(seats) ){
      onSubmit(seats);  // This calls the handleSubmit from Sidebar
      setTotalSeats('');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '400px',
          padding: '24px',
          borderRadius: '8px'
        }
      }}
    >
      <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600, paddingBottom: '16px' }}>
        Set Total Seats
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Total Seats"
          type="number"
          variant="outlined"
          value={totalSeats}
          onChange={(e) => setTotalSeats(e.target.value)}
          sx={{ marginBottom: '24px' }}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            textTransform: 'none',
            padding: '8px 16px'
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{ 
            textTransform: 'none',
            padding: '8px 16px'
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SetTotalSeatsPopup;