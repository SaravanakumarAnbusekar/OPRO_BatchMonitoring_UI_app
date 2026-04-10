import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Skeleton,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import { useBatchDetails } from '../hooks/useBatchDetails';
import BatchHeader from '../components/BatchDetails/BatchHeader';
import MetricCards from '../components/BatchDetails/MetricCards';
import BatchSummaryTable from '../components/BatchDetails/BatchSummaryTable';
import ExecutionTimeline from '../components/BatchDetails/ExecutionTimeline';
import Layout from '../components/layout/Layout';
import EmptyState from '../components/shared/EmptyState';
import { exportBatchPdf, emailBatchReport, downloadBatchLogCsv } from '../services/exportService';

/**
 * Page 2 – Batch Details View.
 * Displays full batch analytics for a given batch ID.
 */
const BatchDetailsPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = React.useState('');

  const decodedId = batchId ? decodeURIComponent(batchId) : undefined;
  const { batch, isLoading, isError, error, notFound, refetch } = useBatchDetails(decodedId);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleDownloadCsv = useCallback(() => {
    if (!batch) return;
    downloadBatchLogCsv(batch);
    setSnackbar('Batch log downloaded as CSV');
  }, [batch]);

  const handleExportPdf = useCallback(async () => {
    if (!batch) return;
    await exportBatchPdf(batch);
    setSnackbar('PDF export – Coming Soon!');
  }, [batch]);

  const handleEmail = useCallback(async () => {
    if (!batch) return;
    await emailBatchReport(batch, '');
    setSnackbar('Email report – Coming Soon!');
  }, [batch]);

  const handleViewAll = useCallback((metricType: 'orders' | 'allocated' | 'suggestions') => {
    setSnackbar(`View All ${metricType} – Coming Soon!`);
  }, []);

  return (
    <Layout>
      {/* Back button */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="text"
          color="primary"
          sx={{ fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}
          aria-label="Return to batch list"
          data-testid="back-button"
        >
          ◄ Return to List
        </Button>
      </Box>

      {/* Error state */}
      {isError && (
        <Alert severity="error" action={
          <Button size="small" color="inherit" onClick={() => refetch()} startIcon={<RefreshIcon />}>Retry</Button>
        } sx={{ mb: 3 }}>
          {error?.message ?? 'Failed to load batch details.'}
        </Alert>
      )}

      {/* Not found */}
      {notFound && (
        <EmptyState
          title="Batch not found"
          description={`No batch found with ID "${decodedId}".`}
          actionLabel="Return to List"
          onAction={handleBack}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <Box>
          <Skeleton variant="text" height={60} width="60%" sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" height={30} width="40%" sx={{ mx: 'auto', mb: 4 }} />
          <Box display="flex" gap={3} mb={4}>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={160} sx={{ flex: 1, borderRadius: 1 }} />)}
          </Box>
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {/* Batch detail content */}
      {!isLoading && !isError && batch && (
        <>
          <BatchHeader batch={batch} onDownload={handleDownloadCsv} />
          <MetricCards batch={batch} onViewAll={handleViewAll} />
          <BatchSummaryTable batch={batch} />
          <ExecutionTimeline batch={batch} />

          {/* Action buttons */}
          <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" mt={2} pb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportPdf}
              aria-label="Export batch report as PDF"
              data-testid="action-export-pdf"
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              aria-label="Refresh batch data"
              data-testid="action-refresh"
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<EmailIcon />}
              onClick={handleEmail}
              aria-label="Email batch report"
              data-testid="action-email"
            >
              Email Report
            </Button>
          </Box>
        </>
      )}

      {/* "Coming Soon" toast */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
        data-testid="coming-soon-toast"
        aria-live="polite"
      />
    </Layout>
  );
};

export default BatchDetailsPage;
