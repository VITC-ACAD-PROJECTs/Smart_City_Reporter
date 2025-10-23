import React from 'react';
import { Card, CardContent, Box, Stack, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FilterList, Sort } from '@mui/icons-material';

export default function FiltersPanel({ statusFilter, priorityFilter, setStatusFilter, setPriorityFilter, sortOrder, setSortOrder }) {
  return (
    <Card 
      elevation={0} 
      sx={{ 
        mb: 4, 
        border: '1px solid #e5e7eb', 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={3} 
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList sx={{ fontSize: 20, color: '#667eea' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
              Filter by:
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={e => setStatusFilter(e.target.value)}
              sx={{ borderRadius: 1.5, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' } }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={e => setPriorityFilter(e.target.value)}
              sx={{ borderRadius: 1.5, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' } }}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { md: 4 } }}>
            <Sort sx={{ fontSize: 20, color: '#667eea' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
              Sort by:
            </Typography>
          </Box>

          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 160,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused': {
                  borderColor: '#667eea',
                },
              },
            }}
          >
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={e => setSortOrder(e.target.value)}
            >
              <MenuItem value="latest">Latest</MenuItem>
              <MenuItem value="upvotes">Most Upvoted</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </CardContent>
    </Card>
  );
}
