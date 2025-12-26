import { Box, Grid, Paper, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

interface AnalyzerSkeletonProps {
  variant?: "full" | "results";
}

export const AnalyzerSkeleton: React.FC<AnalyzerSkeletonProps> = ({
  variant = "results",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (variant === "full") {
    return (
      <Grid container spacing={isMobile ? 2 : 4}>
        {/* Input Section Skeleton */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: isMobile ? 2 : 3 }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 1, mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Skeleton
                variant="rectangular"
                width={120}
                height={40}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width={100}
                height={40}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Results Section Skeleton */}
        <Grid item xs={12} lg={6}>
          <ResultsSkeleton isMobile={isMobile} />
        </Grid>
      </Grid>
    );
  }

  return <ResultsSkeleton isMobile={isMobile} />;
};

const ResultsSkeleton: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <Paper sx={{ p: isMobile ? 2 : 3, minHeight: isMobile ? 400 : 600 }}>
    {/* Title */}
    <Skeleton variant="text" width="50%" height={36} sx={{ mb: 2 }} />

    {/* Tabs */}
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width={isMobile ? 80 : 120}
          height={48}
          sx={{ borderRadius: 1 }}
        />
      ))}
    </Box>

    {/* Stats Grid */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={6} sm={3} key={i}>
          <Skeleton
            variant="rectangular"
            height={80}
            sx={{ borderRadius: 1 }}
          />
        </Grid>
      ))}
    </Grid>

    {/* Charts */}
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Skeleton
          variant="rectangular"
          height={200}
          sx={{ borderRadius: 1 }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton
          variant="rectangular"
          height={200}
          sx={{ borderRadius: 1 }}
        />
      </Grid>
    </Grid>

    {/* Cards List */}
    <Box sx={{ mt: 3 }}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={60}
          sx={{ borderRadius: 1, mb: 1 }}
        />
      ))}
    </Box>
  </Paper>
);

export default AnalyzerSkeleton;
