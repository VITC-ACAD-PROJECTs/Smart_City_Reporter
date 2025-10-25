
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Stack,
  useTheme,
  Divider,
  Pagination,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  TrendingUp,
  CheckCircle,
  Warning,
  PendingActions,
  LocationOn,
  AccessTime,
  AddCircleOutline,
} from '@mui/icons-material';
import Link from 'next/link';
import IssueCard from '../components/IssueCard';
import PageHeader from '../components/PageHeader';
import FiltersPanel from '../components/FiltersPanel';
import { apiFetch } from '@/lib/api';

const RECENT_ISSUES_PAGE_SIZE = 5;

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    apiFetch('/api/issues?limit=100&sort=createdAt:desc')
      .then(res => res.json())
      .then(data => {
        setIssues(Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIssues([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [issues, statusFilter, priorityFilter, sortOrder]);

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
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      return 0;
    });
  }, [issues, statusFilter, priorityFilter, sortOrder]);

  const totalPages = Math.ceil(filteredIssues.length / RECENT_ISSUES_PAGE_SIZE);
  const effectivePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  useEffect(() => {
    if (currentPage !== effectivePage) {
      setCurrentPage(effectivePage);
    }
  }, [currentPage, effectivePage]);

  const paginatedIssues = useMemo(() => {
    if (filteredIssues.length === 0) {
      return [];
    }

    const start = (effectivePage - 1) * RECENT_ISSUES_PAGE_SIZE;
    return filteredIssues.slice(start, start + RECENT_ISSUES_PAGE_SIZE);
  }, [filteredIssues, effectivePage]);

  const pageStart = filteredIssues.length === 0 ? 0 : (effectivePage - 1) * RECENT_ISSUES_PAGE_SIZE + 1;
  const pageEnd = filteredIssues.length === 0 ? 0 : Math.min(pageStart + RECENT_ISSUES_PAGE_SIZE - 1, filteredIssues.length);

  const stats = {
    total: filteredIssues.length,
    open: filteredIssues.filter(i => i.status === 'open').length,
    inProgress: filteredIssues.filter(i => i.status === 'in_progress').length,
    resolved: filteredIssues.filter(i => i.status === 'resolved').length,
  };

  const statsTotal = stats.total;

  const rates = useMemo(
    () => ({
      open: statsTotal ? (stats.open / statsTotal) * 100 : 0,
      inProgress: statsTotal ? (stats.inProgress / statsTotal) * 100 : 0,
      resolved: statsTotal ? (stats.resolved / statsTotal) * 100 : 0,
    }),
    [stats.inProgress, stats.open, stats.resolved, statsTotal],
  );

  const newIssues = useMemo(() => {
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;

    return issues.reduce((count, issue) => {
      if (!issue?.createdAt) {
        return count;
      }

      const createdAt = new Date(issue.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        return count;
      }

      return now - createdAt.getTime() <= day ? count + 1 : count;
    }, 0);
  }, [issues]);

  const formatLabel = value => {
    if (!value || typeof value !== 'string') {
      return 'Unknown';
    }

    return value
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const priorityOrder = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const statCards = useMemo(
    () => [
      {
        title: 'Total Issues',
        value: stats.total,
        subtitle: newIssues > 0 ? `${newIssues} new in the last 24 hours` : 'Track the pulse across all wards',
        icon: <TrendingUp sx={{ color: '#fff', fontSize: 26 }} />,
        accent: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      },
      {
        title: 'Open Issues',
        value: stats.open,
        subtitle: 'Awaiting acknowledgement',
        icon: <Warning sx={{ color: '#fff', fontSize: 26 }} />,
        accent: '#f97316',
        gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
        progress: rates.open,
      },
      {
        title: 'In Progress',
        value: stats.inProgress,
        subtitle: 'Work is currently underway',
        icon: <PendingActions sx={{ color: '#fff', fontSize: 26 }} />,
        accent: '#f59e0b',
        gradient: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
        progress: rates.inProgress,
      },
      {
        title: 'Resolved',
        value: stats.resolved,
        subtitle: 'Closed successfully',
        icon: <CheckCircle sx={{ color: '#fff', fontSize: 26 }} />,
        accent: '#22c55e',
        gradient: 'linear-gradient(135deg, #34d399 0%, #22c55e 100%)',
        progress: rates.resolved,
      },
    ],
    [newIssues, rates.inProgress, rates.open, rates.resolved, stats.inProgress, stats.open, stats.resolved, stats.total],
  );

  const statusBreakdown = useMemo(() => {
    const config = [
      { key: 'open', label: 'Open', color: '#f97316' },
      { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
      { key: 'resolved', label: 'Resolved', color: '#22c55e' },
    ];

    return config.map(item => {
      const count = filteredIssues.filter(issue => issue.status === item.key).length;
      return {
        ...item,
        count,
        percentage: statsTotal ? Math.round((count / statsTotal) * 100) : 0,
      };
    });
  }, [filteredIssues, statsTotal]);

  const priorityBreakdown = useMemo(() => {
    const config = [
      { key: 'high', label: 'High', color: '#ef4444' },
      { key: 'medium', label: 'Medium', color: '#f59e0b' },
      { key: 'low', label: 'Low', color: '#22c55e' },
    ];

    return config.map(item => {
      const count = filteredIssues.filter(issue => (issue.priority || '').toLowerCase() === item.key).length;
      return {
        ...item,
        count,
      };
    });
  }, [filteredIssues]);

  const spotlightIssues = useMemo(() => {
    const cloned = [...filteredIssues];

    return cloned
      .sort((a, b) => {
        const priorityA = priorityOrder[(a?.priority || '').toLowerCase()] ?? 3;
        const priorityB = priorityOrder[(b?.priority || '').toLowerCase()] ?? 3;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const dateA = a?.createdAt ? new Date(a.createdAt).getTime() || 0 : 0;
        const dateB = b?.createdAt ? new Date(b.createdAt).getTime() || 0 : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [filteredIssues]);

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
    default: '#6366f1',
  };

  const statusColors = {
    open: '#f97316',
    in_progress: '#f59e0b',
    resolved: '#22c55e',
  };

  const formatDate = value => {
    if (!value) {
      return 'Unknown';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Unknown';
    }

    return parsed.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const StatCard = ({ title, value, subtitle, icon, accent, gradient, progress }) => {
    const safeProgress = typeof progress === 'number' ? Math.max(0, Math.min(100, progress)) : null;

    return (
      <Box
        sx={{
          borderRadius: 3,
          p: 3,
          border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.14)'}`,
          background: isDark
            ? 'linear-gradient(140deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.88) 100%)'
            : 'linear-gradient(140deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.96) 100%)',
          boxShadow: isDark
            ? '0 18px 40px rgba(8, 15, 25, 0.55)'
            : '0 18px 40px rgba(99, 102, 241, 0.12)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2,
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: '-15% -30% auto auto',
            width: '70%',
            height: '70%',
            background: alpha(accent, 0.2),
            borderRadius: '50% / 40%',
            opacity: isDark ? 0.35 : 0.18,
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: gradient,
                boxShadow: `0 18px 32px ${alpha(accent, 0.35)}`,
              }}
            >
              {icon}
            </Box>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : accent, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {subtitle}
            </Typography>
          </Box>

          {safeProgress !== null && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={safeProgress}
                sx={{
                  mt: 1.5,
                  height: 6,
                  borderRadius: 999,
                  bgcolor: alpha(accent, isDark ? 0.25 : 0.12),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    background: gradient,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                {Math.round(safeProgress)}% of filtered issues
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    );
  };

  const InsightCard = ({ title, subtitle, children }) => (
    <Box
      sx={{
        borderRadius: 3,
        p: 3,
        border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.12)'}`,
        background: isDark
          ? 'linear-gradient(150deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 100%)'
          : 'linear-gradient(150deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.94) 100%)',
        boxShadow: isDark
          ? '0 16px 36px rgba(8, 15, 25, 0.45)'
          : '0 16px 36px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box>
        <Typography
          variant="overline"
          sx={{
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: isDark ? alpha('#cbd5f5', 0.95) : alpha('#6366f1', 0.85),
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pb: 8,
        background: isDark
          ? 'linear-gradient(180deg, #0f172a 0%, #111827 40%, #0f172a 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 35%, #f8fafc 100%)',
      }}
    >
      <PageHeader
        title="Dashboard"
        summary={{
          titleText: 'Overview of civic issues',
          subText: 'Monitor and track issues in real-time',
        }}
      />

      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, mt: 4, maxWidth: 1360, mx: 'auto', width: '100%' }}>
        <Box
          sx={{
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            mb: 5,
            position: 'relative',
            overflow: 'hidden',
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.92) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(229, 231, 255, 0.75) 100%)',
            border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(99, 102, 241, 0.22)'}`,
            boxShadow: isDark
              ? '0 28px 60px rgba(8, 15, 25, 0.55)'
              : '0 28px 60px rgba(99, 102, 241, 0.18)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: '-25% -15% auto auto',
              width: '45%',
              height: '160%',
              background: alpha('#6366f1', isDark ? 0.25 : 0.18),
              filter: 'blur(80px)',
              opacity: 0.9,
              pointerEvents: 'none',
            }}
          />

          <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                gap: 3,
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{ letterSpacing: '0.12em', fontWeight: 700, color: isDark ? alpha('#cbd5f5', 0.9) : alpha('#6366f1', 0.85) }}
                >
                  Citywide pulse
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.75 }}>
                  How the city is doing today
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 420 }}>
                  Stay ahead of civic activity with live metrics updated as residents report new issues.
                </Typography>
              </Box>

              <Chip
                icon={<TrendingUp sx={{ fontSize: 18 }} />}
                label={newIssues > 0 ? `${newIssues} new issue${newIssues === 1 ? '' : 's'} in the last day` : 'Feed updates in real time'}
                sx={{
                  alignSelf: { xs: 'flex-start', md: 'center' },
                  borderRadius: '999px',
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.5,
                  background: isDark ? alpha('#6366f1', 0.2) : alpha('#6366f1', 0.12),
                  color: isDark ? '#e0e7ff' : '#4338ca',
                }}
              />
            </Box>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {statCards.map(card => (
                <Grid item xs={12} sm={6} md={3} key={card.title}>
                  <StatCard {...card} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Box>

        <FiltersPanel
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          setStatusFilter={setStatusFilter}
          setPriorityFilter={setPriorityFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <Grid container spacing={{ xs: 3, lg: 4 }} alignItems="stretch">
          <Grid item xs={12} lg={8}>
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                background: isDark
                  ? 'linear-gradient(150deg, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.85) 100%)'
                  : 'linear-gradient(150deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.94) 100%)',
                border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.16)'}`,
                boxShadow: isDark
                  ? '0 22px 46px rgba(8, 15, 25, 0.5)'
                  : '0 22px 46px rgba(15, 23, 42, 0.12)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Recent Issues
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stay updated on the latest reports from residents
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  {loading ? <Chip label="Loading" size="small" variant="outlined" color="primary" /> : null}
                  <Button
                    component={Link}
                    href="/upload"
                    startIcon={<AddCircleOutline sx={{ fontSize: 20 }} />}
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      py: 0.75,
                      backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 18px 34px rgba(99, 102, 241, 0.28)',
                      color: '#fff',
                      '&:hover': {
                        backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 22px 44px rgba(99, 102, 241, 0.32)',
                      },
                    }}
                  >
                    + Report Issue
                  </Button>
                </Stack>
              </Box>

              {loading && <LinearProgress sx={{ mb: 3, borderRadius: 999 }} />}

              <List sx={{ '& > *:not(:last-child)': { mb: 2.5 } }}>
                {filteredIssues.length === 0 && !loading ? (
                  <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No issues reported yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      New reports will appear here as soon as the community submits them.
                    </Typography>
                  </Box>
                ) : (
                  paginatedIssues.map((issue, index) => <IssueCard key={issue._id || issue.id || index} issue={issue} />)
                )}
              </List>

              {filteredIssues.length > 0 ? (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  sx={{ mt: 3 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Showing {pageStart}–{pageEnd} of {filteredIssues.length} issues
                  </Typography>
                  {totalPages > 1 ? (
                    <Pagination
                      count={totalPages}
                      page={effectivePage}
                      onChange={(_event, value) => setCurrentPage(value)}
                      color="primary"
                      shape="rounded"
                      size="small"
                    />
                  ) : null}
                </Stack>
              ) : null}
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <InsightCard title="Status Breakdown" subtitle="Share of issues matching the current filters">
                {statsTotal === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Adjust the filters or wait for new reports to see live breakdowns.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {statusBreakdown.map(status => (
                      <Box key={status.key}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {status.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {status.count} · {status.percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={status.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 999,
                            bgcolor: alpha(status.color, isDark ? 0.25 : 0.14),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 999,
                              background: `linear-gradient(135deg, ${status.color} 0%, ${alpha(status.color, 0.85)} 100%)`,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </InsightCard>

              <InsightCard title="Priority Mix" subtitle="Helps teams plan their response effort">
                {priorityBreakdown.every(item => item.count === 0) ? (
                  <Typography variant="body2" color="text.secondary">
                    No priority information for the current selection yet.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                    {priorityBreakdown.map(priority => (
                      <Chip
                        key={priority.key}
                        label={`${priority.label} (${priority.count})`}
                        sx={{
                          borderRadius: '20px',
                          fontWeight: 600,
                          background: alpha(priority.color, isDark ? 0.22 : 0.12),
                          color: isDark ? '#f8fafc' : priority.color,
                          border: `1px solid ${alpha(priority.color, 0.35)}`,
                          px: 1,
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </InsightCard>

              <InsightCard title="Priority Spotlight" subtitle="Top issues that need attention">
                {spotlightIssues.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Once reports come in, the most urgent issues will appear here automatically.
                  </Typography>
                ) : (
                  <Stack
                    spacing={2.25}
                    divider={<Divider flexItem sx={{ borderColor: alpha(isDark ? '#334155' : '#cbd5f5', isDark ? 0.45 : 0.5) }} />}
                  >
                    {spotlightIssues.map((issue, index) => {
                      const priorityKey = (issue?.priority || '').toLowerCase();
                      const statusKey = (issue?.status || '').toLowerCase();
                      const priorityColor = priorityColors[priorityKey] || priorityColors.default;
                      const statusColor = statusColors[statusKey] || '#64748b';
                      const title =
                        issue?.title ||
                        issue?.issueTitle ||
                        issue?.heading ||
                        (issue?.description ? `${issue.description.slice(0, 48)}${issue.description.length > 48 ? '…' : ''}` : 'Untitled issue');
                      const location =
                        issue?.ward?.name ||
                        issue?.ward ||
                        issue?.location ||
                        issue?.address ||
                        issue?.area ||
                        'Location unavailable';

                      return (
                        <Box key={issue?._id || issue?.id || index} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
                              {title}
                            </Typography>
                            <Chip
                              label={formatLabel(priorityKey || 'unknown')}
                              size="small"
                              sx={{
                                borderRadius: '999px',
                                color: '#fff',
                                fontWeight: 600,
                                height: 24,
                                background: `linear-gradient(135deg, ${priorityColor} 0%, ${alpha(priorityColor, 0.8)} 100%)`,
                              }}
                            />
                          </Box>

                          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center">
                            <Chip
                              label={formatLabel(statusKey || 'unknown')}
                              size="small"
                              sx={{
                                borderRadius: '999px',
                                fontWeight: 600,
                                height: 24,
                                color: isDark ? '#0f172a' : '#fff',
                                background: isDark
                                  ? alpha(statusColor, 0.45)
                                  : `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
                              }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <AccessTime sx={{ fontSize: 18, color: alpha('#64748b', 0.9) }} />
                              <Typography variant="body2" color="text.secondary">
                                Reported {formatDate(issue?.createdAt)}
                              </Typography>
                            </Box>
                          </Stack>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <LocationOn sx={{ fontSize: 18, color: alpha(priorityColor, 0.85) }} />
                            <Typography variant="body2" color="text.secondary">
                              {location}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </InsightCard>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
