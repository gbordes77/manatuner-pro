import { Box, Card, CardContent, Grid, Skeleton } from "@mui/material";
import React from "react";

interface AnalyzerSkeletonProps {
  isMobile?: boolean;
}

export const AnalyzerSkeleton: React.FC<AnalyzerSkeletonProps> = ({
  isMobile = false,
}) => {
  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Hero Card Skeleton */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(155, 89, 182, 0.1))",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Skeleton
            variant="circular"
            width={isMobile ? 80 : 120}
            height={isMobile ? 80 : 120}
            sx={{ mx: "auto", mb: 2 }}
          />
          <Skeleton
            variant="text"
            width={isMobile ? 150 : 200}
            height={40}
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width={isMobile ? 100 : 150}
            height={24}
            sx={{ mx: "auto" }}
          />
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Skeleton
                  variant="text"
                  width={60}
                  height={32}
                  sx={{ mx: "auto" }}
                />
                <Skeleton
                  variant="text"
                  width={80}
                  height={20}
                  sx={{ mx: "auto" }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Color Distribution Skeleton */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={80}
                height={32}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Recommendations Skeleton */}
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: "action.hover",
              }}
            >
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};
