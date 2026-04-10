import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

/**
 * Ashley Furniture "A" logo mark – geometric SVG representing the brand icon.
 * Renders cleanly at any size on the orange header background.
 */
const AshleyLogoMark: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      bgcolor: 'rgba(255,255,255,0.12)',
      borderRadius: 1,
      px: 1.25,
      py: 0.5,
      mr: 0.5,
      flexShrink: 0,
    }}
    aria-label="Ashley Furniture Industries"
    role="img"
    data-testid="ashley-logo"
  >
    {/* Geometric "A" mark – simplified Ashley brand icon */}
    <svg
      width="26"
      height="30"
      viewBox="0 0 26 30"
      fill="none"
      aria-hidden="true"
    >
      {/* Left leg of A */}
      <path d="M13 1 L1 29 H6.5 L13 11 L19.5 29 H25 Z" fill="white" />
      {/* Crossbar */}
      <rect x="7.5" y="20" width="11" height="2.5" rx="1" fill="white" />
    </svg>

    {/* ASHLEY / FURNITURE stacked text */}
    <Box sx={{ lineHeight: 1, userSelect: 'none' }}>
      <Typography
        component="span"
        sx={{
          display: 'block',
          color: 'white',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '2px',
          lineHeight: 1.1,
        }}
      >
        ASHLEY
      </Typography>
      <Typography
        component="span"
        sx={{
          display: 'block',
          color: 'rgba(255,255,255,0.78)',
          fontSize: '8px',
          fontWeight: 400,
          letterSpacing: '1.8px',
          lineHeight: 1.4,
        }}
      >
        FURNITURE
      </Typography>
    </Box>
  </Box>
);

/**
 * Application header with Ashley Furniture branding and icon controls.
 * Left: Ashley logo mark + "OPRO Cronjob Monitor" app title.
 * Right: Search · Settings · User avatar.
 */
const Header: React.FC = () => (
  <AppBar
    position="sticky"
    elevation={1}
    sx={{ backgroundColor: 'primary.main', zIndex: (theme) => theme.zIndex.appBar }}
    role="banner"
  >
    {/* Skip to main content – accessibility */}
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
      onFocus={(e) => {
        (e.target as HTMLAnchorElement).style.left = '16px';
        (e.target as HTMLAnchorElement).style.width = 'auto';
        (e.target as HTMLAnchorElement).style.height = 'auto';
      }}
      onBlur={(e) => {
        (e.target as HTMLAnchorElement).style.left = '-9999px';
        (e.target as HTMLAnchorElement).style.width = '1px';
        (e.target as HTMLAnchorElement).style.height = '1px';
      }}
    >
      Skip to main content
    </a>

    <Toolbar sx={{ gap: 1, minHeight: { xs: '56px', sm: '64px' } }}>
      {/* Ashley Furniture logo mark */}
      <AshleyLogoMark />

      {/* Vertical divider between logo and app title */}
      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: 'rgba(255,255,255,0.25)', mx: 1, my: 1.25 }}
        aria-hidden="true"
      />

      {/* App title with monitor icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexGrow: 1 }}>
        <MonitorHeartIcon
          sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 20 }}
          aria-hidden="true"
        />
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: 600,
            letterSpacing: '0.3px',
            color: 'primary.contrastText',
            fontSize: { xs: '14px', sm: '16px' },
          }}
        >
          OPRO Cronjob Monitor
        </Typography>
      </Box>

      {/* Search */}
      <Tooltip title="Search" arrow>
        <IconButton
          color="inherit"
          aria-label="Open search"
          size="medium"
          data-testid="header-search-btn"
        >
          <SearchIcon />
        </IconButton>
      </Tooltip>

      {/* Settings */}
      <Tooltip title="Settings" arrow>
        <IconButton
          color="inherit"
          aria-label="Open settings"
          size="medium"
          data-testid="header-settings-btn"
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      {/* User avatar */}
      <Box ml={0.5}>
        <Tooltip title="User account" arrow>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: 'primary.dark',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            aria-label="User account"
            data-testid="header-avatar"
          >
            AF
          </Avatar>
        </Tooltip>
      </Box>
    </Toolbar>
  </AppBar>
);

export default Header;
