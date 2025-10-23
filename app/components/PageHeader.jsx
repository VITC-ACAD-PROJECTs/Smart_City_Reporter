'use client';
import React from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export default function PageHeader({ title, summary }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        position: 'relative',
        background: isDark 
          ? 'linear-gradient(135deg, #4c1d95 0%, #581c87 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        py: { xs: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        mb: 0,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
          animation: `${float} 8s ease-in-out infinite`,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          animation: `${float} 6s ease-in-out infinite reverse`,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            animation: `${shimmer} 3s ease-in-out infinite`,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            backgroundSize: '1000px 100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
          }}
        />
        <Typography 
          variant="overline" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.85)', 
            fontWeight: 700, 
            letterSpacing: 2, 
            fontSize: '0.875rem',
            display: 'inline-block',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            mb: 2,
          }}
        >
          {title}
        </Typography>
        {summary && (
          <>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mt: 2, 
                mb: 2,
                fontSize: { xs: '2rem', md: '2.75rem' },
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.15)',
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {summary.titleText || ''}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.125rem' },
                maxWidth: '600px',
                lineHeight: 1.6,
                textShadow: '0 1px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {summary.subText || ''}
            </Typography>
          </>
        )}
      </Container>

      {/* Bottom wave decoration */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          right: 0,
          height: 30,
          background: isDark ? '#0f172a' : '#f8fafc',
          clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)',
        }}
      />
    </Box>
  );
}
