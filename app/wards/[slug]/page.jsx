
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Paper, List, Chip, LinearProgress, Alert } from '@mui/material';
import IssueCard from '@/app/components/IssueCard';
import PageHeader from '@/app/components/PageHeader';
import FiltersPanel from '@/app/components/FiltersPanel';

export default function WardIssues() {
  const { slug } = useParams();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wardName, setWardName] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  useEffect(() => {
    if (slug) {
      const fetchWardData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch ward name (assuming you have an API for this or a local data source)
          // For now, we'll just format the slug
          setWardName(slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

          const response = await fetch(`/api/issues/ward/${slug}`, {
            headers: {
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key'
            }
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Ward data received:', data);
          
          // Handle different response formats
          setIssues(data.issues || data.items || data);
        } catch (e) {
          console.error("Failed to fetch ward issues:", e);
          setError('Failed to load issues for this ward.');
        } finally {
          setLoading(false);
        }
      };
      fetchWardData();
    }
  }, [slug]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || issue.priority === priorityFilter;
      return statusMatch && priorityMatch;
    }).sort((a, b) => {
      if (sortOrder === 'latest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortOrder === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return 0;
    });
  }, [issues, statusFilter, priorityFilter, sortOrder]);

  return (
    <Box sx={{ bgcolor: '#f3f6fb', minHeight: '100vh', pb: 6 }}>
      <PageHeader
        title={`Issues in ${wardName}`}
        summary={{
          titleText: `Overview of civic issues in ${wardName}`,
          subText: 'Monitor and track issues in real-time',
        }}
      />

      <Box sx={{ px: 4, mt: -6 }}>
        <FiltersPanel
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          setStatusFilter={setStatusFilter}
          setPriorityFilter={setPriorityFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <Paper
          elevation={2}
          sx={{
            p: 4,
            maxWidth: 1200,
            mx: 'auto',
            borderRadius: 3,
            bgcolor: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Reported Issues
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All issues for {wardName}
              </Typography>
            </Box>
            {loading && <Chip label="Loading..." size="small" color="primary" variant="outlined" />}
          </Box>

          {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <List sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
            {!loading && !error && filteredIssues.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No issues reported for this ward yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Be the first to report an issue!
                </Typography>
              </Box>
            ) : (
              filteredIssues.map(issue => <IssueCard key={issue._id} issue={issue} />)
            )}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}
