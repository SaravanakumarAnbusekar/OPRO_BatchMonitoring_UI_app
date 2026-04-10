import React from 'react';
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { BatchResult } from '../../types/batch';
import BatchRow from './BatchRow';
import EmptyState from '../shared/EmptyState';

interface BatchTableProps {
  batches: BatchResult[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onClearFilters: () => void;
}

const COLUMNS = ['Batch ID', 'Time', 'Status', 'Orders', 'Action'];
const SKELETON_ROWS = 5;

/**
 * Main batch list table with pagination and loading skeleton.
 */
const BatchTable: React.FC<BatchTableProps> = ({
  batches,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onClearFilters,
}) => {
  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage + 1); // MUI pagination is 0-based
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPageSizeChange(parseInt(e.target.value, 10));
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <TableContainer>
        <Table aria-label="Batch list table" data-testid="batch-table">
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col}
                  align={col === 'Action' ? 'center' : 'left'}
                  sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', py: 1.5 }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              // Skeleton rows while loading
              Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
                <TableRow key={idx} data-testid="skeleton-row">
                  {COLUMNS.map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" height={24} width={col === 'Action' ? 32 : '80%'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} sx={{ border: 0, p: 0 }}>
                  <EmptyState
                    title="No batches found"
                    description="No batch jobs match your current filters. Try adjusting the search criteria."
                    actionLabel="Clear Filters"
                    onAction={onClearFilters}
                  />
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch, idx) => (
                <BatchRow
                  key={batch.batch_id}
                  batch={batch}
                  rowIndex={(page - 1) * pageSize + idx + 1}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination + summary */}
      {!isLoading && batches.length > 0 && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={2}
          py={1}
          borderTop="1px solid"
          borderColor="divider"
        >
          <Typography variant="caption" color="text.secondary">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} batches
          </Typography>
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Rows:"
            data-testid="batch-pagination"
          />
        </Box>
      )}
    </Paper>
  );
};

export default BatchTable;
