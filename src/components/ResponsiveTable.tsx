import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
} from '@mui/material';

interface TableData {
  [key: string]: any;
}

interface ResponsiveTableProps {
  headers: string[];
  data: TableData[];
  title?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  headers, 
  data, 
  title 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return (
      <Box sx={{ width: '100%' }}>
        {title && (
          <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
            {title}
          </Typography>
        )}
        <Stack spacing={1}>
          {data.map((row, index) => (
            <Card 
              key={index} 
              sx={{ 
                width: '100%',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {headers.map((header, idx) => {
                  const value = row[header.toLowerCase()] || row[header];
                  if (value === undefined || value === null) return null;
                  
                  return (
                    <Box 
                      key={idx}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: idx < headers.length - 1 ? 1 : 0,
                        minHeight: 24
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                          fontSize: '0.75rem'
                        }}
                      >
                        {header}:
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          textAlign: 'right',
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
          {title}
        </Typography>
      )}
      <TableContainer 
        component={Paper} 
        sx={{ 
          width: '100%', 
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: 300,
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell 
                  key={header}
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: theme.palette.grey[50],
                    fontSize: '0.875rem'
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={index}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
              >
                {headers.map((header) => {
                  const value = row[header.toLowerCase()] || row[header];
                  return (
                    <TableCell 
                      key={header}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {value || '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResponsiveTable; 