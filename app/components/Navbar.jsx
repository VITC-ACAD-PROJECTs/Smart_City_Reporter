'use client';
import { AppBar, Toolbar, Button, Box, Typography, Avatar, IconButton, Menu, MenuItem, useScrollTrigger, Slide, Tooltip, useTheme } from '@mui/material';
import { Map, Dashboard as DashboardIcon, AddCircleOutline, Login, Logout, Person, Menu as MenuIcon, LightMode, DarkMode } from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext.jsx';
import { useDarkMode } from '@/app/providers/ThemeProvider';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger({ threshold: 10 });
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const theme = useTheme();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleUserMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);
  const handleMobileMenuOpen = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  const navItems = [
    { label: 'Map', href: '/', icon: <Map sx={{ fontSize: 18 }} /> },
    { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
    { label: 'Report Issue', href: '/upload', icon: <AddCircleOutline sx={{ fontSize: 18 }} />, highlight: true },
  ];

  const isActive = (href) => pathname === href;

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          bgcolor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: darkMode 
            ? '1px solid rgba(255, 255, 255, 0.08)' 
            : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: darkMode 
            ? '0 4px 24px rgba(0, 0, 0, 0.4)' 
            : '0 4px 24px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 64, sm: 70 }, py: 1 }}>
          {/* Logo Section */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              <Map sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' },
                color: darkMode ? '#fff' : '#1f2937',
              }}
            >
              Civic Tracker
            </Typography>
          </Link>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, flex: 1, justifyContent: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                startIcon={item.icon}
                sx={{
                  color: isActive(item.href)
                    ? '#667eea'
                    : darkMode ? 'rgba(255, 255, 255, 0.9)' : '#4b5563',
                  px: 2.5,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  background: isActive(item.href)
                    ? darkMode ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.08)'
                    : item.highlight
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'transparent',
                  ...(item.highlight && {
                    color: darkMode ? '#fff' : '#030303ff !important',
                    boxShadow: '0 3px 18px rgba(102, 126, 234, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.32)',
                  }),
                  '&:hover': {
                    background: isActive(item.href)
                      ? darkMode ? 'rgba(102, 126, 234, 0.22)' : 'rgba(102, 126, 234, 0.14)'
                      : item.highlight
                      ? 'linear-gradient(135deg, #5568d3 0%, #6a3f8a 100%)'
                      : darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    transform: item.highlight ? 'translateY(-2px)' : 'none',
                    boxShadow: item.highlight ? '0 6px 20px rgba(102, 126, 234, 0.4)' : 'none',
                  },
                  '&::after': isActive(item.href) && !item.highlight ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: '2px',
                    bgcolor: '#667eea',
                    borderRadius: '2px 2px 0 0',
                  } : {},
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'} arrow>
              <IconButton
                onClick={toggleDarkMode}
                size="small"
                sx={{
                  color: darkMode ? '#fbbf24' : '#667eea',
                  bgcolor: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                  border: `1px solid ${darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(102, 126, 234, 0.2)'}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(102, 126, 234, 0.12)',
                    transform: 'rotate(180deg) scale(1.05)',
                  },
                }}
              >
                {darkMode ? <LightMode sx={{ fontSize: 20 }} /> : <DarkMode sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            {user ? (
              <>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.75,
                      borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 126, 234, 0.08)',
                      border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(102, 126, 234, 0.2)'}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: darkMode ? '#fff' : '#1f2937', fontWeight: 600, fontSize: '0.875rem' }}>
                      {user.email?.split('@')[0] || 'User'}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="small"
                    sx={{
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 126, 234, 0.08)',
                      border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(102, 126, 234, 0.2)'}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(102, 126, 234, 0.12)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
                      <Person sx={{ fontSize: 18 }} />
                    </Avatar>
                  </IconButton>
                </Box>
                <IconButton
                  size="small"
                  sx={{ display: { xs: 'flex', sm: 'none' } }}
                  onClick={handleUserMenuOpen}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <Person sx={{ fontSize: 18 }} />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <MenuItem onClick={() => { handleUserMenuClose(); logout(); }}>
                    <Logout sx={{ mr: 1, fontSize: 20 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                onClick={login}
                startIcon={<Login sx={{ fontSize: 18 }} />}
                sx={{
                  color: '#fff',
                  px: 2.5,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8a 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              size="small"
              sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                color: darkMode ? '#fff' : '#1f2937',
                ml: 1 
              }}
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Mobile Navigation Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 3,
                minWidth: 220,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.6)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
              },
            }}
          >
            {navItems.map((item) => (
              <MenuItem
                key={item.href}
                component={Link}
                href={item.href}
                onClick={handleMobileMenuClose}
                sx={{
                  gap: 1.5,
                  py: 1.5,
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  bgcolor: isActive(item.href) 
                    ? darkMode ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.08)' 
                    : 'transparent',
                  color: isActive(item.href) ? '#667eea' : 'text.primary',
                  fontWeight: isActive(item.href) ? 600 : 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive(item.href)
                      ? darkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.12)'
                      : darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {item.icon}
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}
