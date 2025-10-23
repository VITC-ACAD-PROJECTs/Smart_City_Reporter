
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
} from '@mui/material';
import PageHeader from '../../../components/PageHeader';
import IssueHistory from '../../../components/IssueHistory';

import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function EditIssue() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');

  useEffect(() => {
    // Fix Leaflet icon paths for Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      setAssignedTo(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/issues/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Issue not found');
        }
        return res.json();
      })
      .then((data) => {
        setIssue(data);
        setStatus(data.status);
        // Keep the assignedTo from the database if it exists, otherwise use the current user's email
        setAssignedTo(data.assignedTo || (user ? user.email : ''));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statusChangeReason) {
      setError('Status change reason is required.');
      return;
    }
    if (statusChangeReason.length < 5) {
      setError('Status change reason must be at least 5 characters long.');
      return;
    }
    try {
      const body = { status, assignedTo, statusChangeReason };
      const res = await apiFetch(`/api/issues/${id}/status`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details.map(d => d.message).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData.error || 'Failed to update issue');
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <PageHeader title="Error" />
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <PageHeader
          title="Manage Issue"
          summary={issue ? { titleText: issue.title || 'No Title', subText: `ID: ${issue._id}` } : undefined}
        />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {issue.lat && issue.lng && (
              <MapContainer center={[issue.lat, issue.lng]} zoom={15} style={{ height: '100%', minHeight: '400px', borderRadius: '8px' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[issue.lat, issue.lng]} />
              </MapContainer>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  Update Status
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        value={status}
                        label="Status"
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Status Change Reason"
                      value={statusChangeReason}
                      onChange={(e) => setStatusChangeReason(e.target.value)}
                      fullWidth
                      multiline
                      rows={4}
                      required
                      helperText="Minimum 5 characters required"
                      error={statusChangeReason.length > 0 && statusChangeReason.length < 5}
                    />
                    <TextField
                      label="Assigned To"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      fullWidth
                      disabled
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ fontWeight: 600 }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <IssueHistory history={issue.history} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
