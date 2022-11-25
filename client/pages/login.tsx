import React from 'react';
import { Box, Button } from '@mui/material';
import { login } from '../services/auth';

const Login = () => {
  const handleLogin = () => {
    login();
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
      <h1>Auth test</h1>
      <Button variant='contained' onClick={handleLogin}>
        Login to Spotify
      </Button>
      </Box>
    </Box>
  );
};

export default Login;
