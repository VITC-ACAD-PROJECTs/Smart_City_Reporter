'use client';
import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function PageHeader({ title, summary }) {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        py: 6,
        px: 4,
        mb: 4,
        borderRadius: 2,
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="overline" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontWeight: 600, 
            letterSpacing: 1.2, 
            fontSize: '0.75rem' 
          }}
        >
          {title}
        </Typography>
        {summary && (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, mb: 1.5 }}>
              {summary.titleText || ''}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {summary.subText || ''}
            </Typography>
          </>
        )}
      </Container>
    </Box>
  );
}
