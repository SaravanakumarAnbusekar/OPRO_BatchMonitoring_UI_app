import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  /** Max width of the content area */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
}

/**
 * Main layout wrapper providing the sticky header and page content area.
 */
const Layout: React.FC<LayoutProps> = ({ children, maxWidth = 'xl' }) => (
  <Box
    sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}
  >
    <Header />
    <Box
      component="main"
      id="main-content"
      sx={{ flexGrow: 1, py: { xs: 2, md: 3 } }}
      tabIndex={-1}
    >
      <Container maxWidth={maxWidth} sx={{ px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </Box>
    {/* Footer placeholder */}
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        textAlign: 'center',
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
        fontSize: '12px',
      }}
    >
      © {new Date().getFullYear()} Ashley Furniture Industries – OPRO Cronjob Monitor
    </Box>
  </Box>
);

export default Layout;
