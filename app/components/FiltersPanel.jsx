import React from 'react';
import { Card, CardContent, Box, Stack, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function FiltersPanel({ statusFilter, priorityFilter, setStatusFilter, setPriorityFilter, sortOrder, setSortOrder }) {
  return (
    <Card elevation={0} sx={{ mb: 4, border: '1px solid #e5e7eb', borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151', minWidth: 60 }}>
            Filter by:
          </Typography>

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

          <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151', minWidth: 60, ml: 4 }}>
            Sort by:
          </Typography>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={e => setSortOrder(e.target.value)}
              sx={{ borderRadius: 1.5, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' } }}
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
