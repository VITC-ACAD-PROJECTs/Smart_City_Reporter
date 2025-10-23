'use client';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext.jsx';

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} href="/" sx={{ marginRight: 2 }}>
            MAP
          </Button>
          <Button color="inherit" component={Link} href="/dashboard" sx={{ marginRight: 2 }}>
            DASHBOARD
          </Button>
          <Button color="inherit" component={Link} href="/upload" sx={{ marginRight: 2 }}>
            REPORT ISSUE
          </Button>
        </Box>
        {user ? (
          <>
            <Typography sx={{ marginRight: 2 }}>
              {user.email || 'Logged in'}
            </Typography>
            <Button color="inherit" onClick={logout}>Logout</Button>
          </>
        ) : (
          <Button color="inherit" onClick={() => login()}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
