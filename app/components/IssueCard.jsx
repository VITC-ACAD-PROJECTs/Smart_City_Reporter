'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia,
  Typography, 
  Box, 
  Stack, 
  IconButton,
  Chip 
} from '@mui/material';
import {
  ThumbUp,
  LocationOn,
  AccessTime,
  Warning,
  CheckCircle,
  PendingActions,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  open: { 
    color: '#ef4444', 
    label: 'Open', 
    bg: '#fee2e2',
    icon: Warning 
  },
  in_progress: { 
    color: '#f59e0b', 
    label: 'In Progress', 
    bg: '#fef3c7',
    icon: PendingActions 
  },
  assigned: { 
    color: '#3b82f6', 
    label: 'Assigned', 
    bg: '#dbeafe',
    icon: PendingActions 
  },
  resolved: { 
    color: '#10b981', 
    label: 'Resolved', 
    bg: '#d1fae5',
    icon: CheckCircle 
  },
};

const priorityConfig = {
  low: { color: '#10b981', bg: '#d1fae5' },
  medium: { color: '#f59e0b', bg: '#fef3c7' },
  high: { color: '#ef4444', bg: '#fee2e2' },
};

export default function IssueCard({ issue }) {
  const { user } = useAuth();

  const statusInfo = statusConfig[issue.status] || statusConfig.open;
  const priorityInfo = priorityConfig[issue.priority] || priorityConfig.medium;
  const StatusIcon = statusInfo.icon;

  const [upvotes, setUpvotes] = useState(issue.upvotes || 0);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const upvotedByArray = Array.isArray(issue.upvotedBy) ? issue.upvotedBy : [];
  const uid = user?.id ?? user?.sub ?? user?.userId ?? null;
  const isInitiallyUpvoted = Boolean(uid && upvotedByArray.some(u => String(u) === String(uid)));
  const [isUpvoted, setIsUpvoted] = useState(isInitiallyUpvoted);

  useEffect(() => {
    const arr = Array.isArray(issue.upvotedBy) ? issue.upvotedBy : [];
    setIsUpvoted(Boolean(uid && arr.some(u => String(u) === String(uid))));
  }, [user, issue.upvotedBy]);

  const handleUpvote = async () => {
    if (!user) {
      alert('Please login to upvote.');
      return;
    }
    setIsUpvoting(true);
    try {
      // Debug: log token snippet so we can inspect what's being sent
      try { console.debug('Upvote token snippet:', String(user.token).slice(0, 40), '...'); } catch (_) {}

      const res = await fetch(`/api/issues/${issue._id}/upvote`, {
        method: 'POST',
        headers: {
          'x-api-key': 'dev-key',
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        console.warn('Upvote failed', res.status, bodyText);
        // Try to parse JSON body, fall back to text
        let parsed = null;
        try { parsed = JSON.parse(bodyText); } catch (_) {}
        const message = parsed?.error || bodyText || `HTTP ${res.status}`;
        throw new Error(message);
      }
      const data = await res.json();
      setUpvotes(data.upvotes || 0);
      try {
        const arr = Array.isArray(data.upvotedBy) ? data.upvotedBy : [];
        const upvotedNow = uid && arr.some(u => String(u) === String(uid));
        setIsUpvoted(Boolean(upvotedNow));
      } catch (_) {}
    } catch (err) {
      console.error('Upvote error:', err.message || err);
      // Show more guidance when token is invalid
      if (String(err.message).toLowerCase().includes('invalid token') || String(err.message).toLowerCase().includes('authorization')) {
        alert(`Upvote failed: ${err.message}\n\nCheck DevTools Network -> request headers to confirm Authorization header is present and correct.`);
      } else {
        alert(err.message || 'Error upvoting issue');
      }
    } finally {
      setIsUpvoting(false);
    }
  };

  // Get image source (URL or base64)
  const getImageSource = () => {
    const imageData = issue.photo || issue.photoUrl || issue.image;
    if (!imageData) return null;

    const raw = String(imageData).trim();
    
    // If it's base64 data and doesn't have the data URL prefix, add it
    if (raw.match(/^[A-Za-z0-9+/=]+$/)) {
      return `data:image/jpeg;base64,${raw}`;
    }
    
    // If it's already a data URL, return as is
    if (raw.startsWith('data:image/')) {
      return raw;
    }
    
    // If it's a URL, return as is
    if (raw.match(/^https?:\/\//i)) {
      return raw;
    }

    return null;
  };

  const [imageSource, setImageSource] = useState(() => getImageSource());
  const [imageError, setImageError] = useState(false);

  // Debug logging
  console.log('Issue data:', {
    _id: issue._id,
    photoUrl: issue.photoUrl,
    photo: issue.photo,
    image: issue.image,
    calculatedUrl: imageSource
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Link href={`/issue/${issue._id}/edit`} style={{ textDecoration: 'none' }}>
      <Card
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          background: '#ffffff',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            background: `linear-gradient(180deg, ${statusInfo.color}, ${statusInfo.color}80)`,
            transform: 'scaleY(0)',
            transformOrigin: 'bottom',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
            borderColor: statusInfo.color,
            '&::before': {
              transform: 'scaleY(1)',
              transformOrigin: 'top',
            },
          },
        }}
      >
        {/* Image Section */}
        {imageSource && !imageError ? (
          <CardMedia
            component="img"
            sx={{
              width: { xs: '100%', sm: 220 },
              height: { xs: 200, sm: 'auto' },
              minHeight: { sm: 200 },
              objectFit: 'cover',
              flexShrink: 0,
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            image={imageSource}
            alt={issue.title}
            onError={(e) => {
              console.error('Failed to load image:', imageSource);
              setImageError(true);
            }}
          />
        ) : imageError ? (
          // Placeholder for failed images
          <Box
            sx={{
              width: { xs: '100%', sm: 220 },
              height: { xs: 200, sm: 'auto' },
              minHeight: { sm: 200 },
              bgcolor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              flexShrink: 0,
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            }}
          >
            <Typography variant="body2" color="inherit">
              Image Not Available
            </Typography>
          </Box>
        ) : null}

        {/* Content Section */}
        <CardContent sx={{ flex: 1, p: 3 }}>
          <Stack spacing={2}>
            {/* Header with Title and Status */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1, gap: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: '#1f2937',
                    flex: 1,
                  }}
                >
                  {issue.title}
                </Typography>
                <Chip
                  icon={<StatusIcon sx={{ fontSize: 16 }} />}
                  label={statusInfo.label}
                  size="small"
                  sx={{
                    bgcolor: statusInfo.bg,
                    color: statusInfo.color,
                    fontWeight: 600,
                    border: `1px solid ${statusInfo.color}40`,
                    boxShadow: `0 2px 8px ${statusInfo.color}20`,
                    transition: 'all 0.3s ease',
                    '& .MuiChip-icon': {
                      color: statusInfo.color,
                    },
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 4px 12px ${statusInfo.color}30`,
                    },
                  }}
                />
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                {issue.description}
              </Typography>
            </Box>

            {/* Metadata Row */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ 
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {/* Priority */}
              <Chip
                label={`${issue.priority?.toUpperCase() || 'MEDIUM'} Priority`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: priorityInfo.bg,
                  color: priorityInfo.color,
                  border: `1px solid ${priorityInfo.color}40`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 8px ${priorityInfo.color}25`,
                  },
                }}
              />

              {/* Location */}
              {(issue.ward || issue.wardName || (issue.lat && issue.lng)) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 16, color: '#6b7280' }} />
                  <Typography variant="caption" color="text.secondary">
                    {issue.ward || issue.wardName || `${issue.lat?.toFixed(4)}, ${issue.lng?.toFixed(4)}`}
                  </Typography>
                </Box>
              )}

              {/* Date */}
              {issue.createdAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 16, color: '#6b7280' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(issue.createdAt)}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Upvote Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  handleUpvote();
                }}
                disabled={isUpvoting || !user}
                size="small"
                sx={{
                  color: isUpvoted ? '#2563eb' : '#9ca3af',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: isUpvoted ? '#e6f0ff' : '#f3f4f6',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    color: '#9ca3af',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <ThumbUp sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {upvotes} {upvotes === 1 ? 'upvote' : 'upvotes'}
              </Typography>
              {!user && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (Login to upvote)
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}