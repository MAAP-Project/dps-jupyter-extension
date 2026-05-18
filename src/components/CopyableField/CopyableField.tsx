import React from 'react';
import { Box, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { handleCopyToClipboard } from '../../utils/generic';

interface CopyableFieldProps {
  label: string;
  value: string;
}

export const CopyableField: React.FC<CopyableFieldProps> = ({ label, value }) => (
  <Box
    sx={{
      '&:hover .copy-button': {
        opacity: 1,
      },
    }}
  >
    <strong>{label}:</strong>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        marginTop: 0.5,
      }}
    >
      <p style={{ margin: 0 }}>{value}</p>
      <IconButton
        size="small"
        onClick={() => handleCopyToClipboard(value)}
        sx={{
          opacity: 0,
          transition: 'opacity 0.2s',
          padding: '2px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
        className="copy-button"
      >
        <ContentCopyIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
    </Box>
  </Box>
);
