'use client';
import { AppBar, Toolbar, Button, Box, Typography, Avatar, IconButton, Menu, MenuItem, useScrollTrigger, Slide, Switch, Tooltip } from '@mui/material';
import { Map, Dashboard as DashboardIcon, AddCircleOutline, Login, Logout, Person, Menu as MenuIcon, LightMode, DarkMode } from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext.jsx';
import { useDarkMode } from '@/app/providers/ThemeProvider';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleUserMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);
  const handleMobileMenuOpen = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  const navItems = [
    { label: 'Map', href: '/', icon: <Map sx={{ fontSize: 20 }} /> },
    { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
    { label: 'Report Issue', href: '/upload', icon: <AddCircleOutline sx={{ fontSize: 20 }} />, highlight: true },
  ];

  const isActive = (href) => pathname === href;

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
          {/* Logo Section */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Map sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Civic Tracker
            </Typography>
          </Link>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flex: 1, justifyContent: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                startIcon={item.icon}
                sx={{
                  color: '#fff',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  background: isActive(item.href) 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : item.highlight 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'transparent',
                  border: isActive(item.href) 
                    ? '1px solid rgba(255, 255, 255, 0.3)' 
                    : '1px solid transparent',
                  backdropFilter: isActive(item.href) ? 'blur(10px)' : 'none',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  '&::before': item.highlight ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    animation: 'shimmer 3s infinite',
                  } : {},
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton
                onClick={toggleDarkMode}
                sx={{
                  color: '#fff',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'rotate(180deg)',
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
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                      {user.email?.split('@')[0] || 'User'}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.25)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff', color: '#667eea' }}>
                      <Person sx={{ fontSize: 20 }} />
                    </Avatar>
                  </IconButton>
                </Box>
                <IconButton
                  sx={{ display: { xs: 'flex', sm: 'none' }, color: '#fff' }}
                  onClick={handleUserMenuOpen}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
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
                startIcon={<Login />}
                sx={{
                  color: '#fff',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff', ml: 1 }}
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
                borderRadius: 2,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
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
                  background: isActive(item.href) ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  fontWeight: isActive(item.href) ? 600 : 400,
                }}
              >
                {item.icon}
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>

        {/* Shimmer Animation Keyframes */}
        <style jsx global>{`
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 200%;
            }
          }
        `}</style>
      </AppBar>
    </HideOnScroll>
  );
}
