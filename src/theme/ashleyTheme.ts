import { createTheme } from '@mui/material/styles';

/**
 * Ashley Furniture branded MUI theme.
 * Primary: Ashley brand orange (#E87722).
 * Secondary: mild blue-gray (#78909C).
 */
const ashleyTheme = createTheme({
  palette: {
    primary: {
      main: '#E87722',    // Ashley brand orange
      light: '#F09A55',   // Lighter orange
      dark: '#B85810',    // Deeper orange
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#78909C',    // Mild blue-gray
      light: '#A0BAC5',   // Light blue-gray
      dark: '#546E7A',    // Deeper blue-gray
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#B71C1C',
    },
    warning: {
      main: '#F57C00',
      light: '#FFB74D',
      dark: '#E65100',
    },
    info: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: '48px',
      fontWeight: 700,
      letterSpacing: '1px',
    },
    h2: {
      fontSize: '36px',
      fontWeight: 700,
    },
    h3: {
      fontSize: '24px',
      fontWeight: 600,
    },
    h4: {
      fontSize: '20px',
      fontWeight: 600,
    },
    h5: {
      fontSize: '18px',
      fontWeight: 500,
    },
    h6: {
      fontSize: '16px',
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '14px',
      fontWeight: 500,
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
    },
    overline: {
      fontSize: '14px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '13px',
            letterSpacing: '0.5px',
            backgroundColor: '#FEF3E8',  // Mild orange tint – matches Ashley orange brand
            color: '#5D3A1A',            // Deep warm brown for contrast on orange tint
            borderBottom: '2px solid #F0BC8A',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: '#FFF8F0',  // Very light warm orange hover
            cursor: 'pointer',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

/** Custom color tokens for metrics, accents, and branding (beyond MUI palette) */
export const ashleyColors = {
  metrics: {
    primary: '#E87722',   // Ashley orange – Total Orders card
    secondary: '#2C5F2D', // Forest green  – Allocated Orders card (kept for semantic clarity)
    accent: '#B85810',    // Deep orange   – Suggestions card
  },
  neutral: {
    border: '#E0E0E0',
    borderStrong: '#BDBDBD',
  },
  brand: {
    orange: '#E87722',
    orangeLight: '#FEF3E8',
    orangeDark: '#B85810',
    gray: '#78909C',
  },
} as const;

export default ashleyTheme;
