import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { COLOR_NAMES, MANA_COLORS } from "../../types";

interface ColorDataItem {
  name: string;
  value: number;
  color: string;
  textColor: string;
}

interface ManaDistributionChartProps {
  colorData: ColorDataItem[];
  totalMana: number;
  isMobile: boolean;
  isSmallMobile: boolean;
}

export const ManaDistributionChart: React.FC<ManaDistributionChartProps> = ({
  colorData,
  totalMana,
  isMobile,
  isSmallMobile,
}) => {
  return (
    <Paper sx={{ p: isMobile ? 2 : 3 }}>
      <Typography
        variant={isMobile ? "body1" : "h6"}
        gutterBottom
        sx={{
          fontSize: isMobile ? "1rem" : undefined,
          fontWeight: "bold",
        }}
      >
        Mana Production Distribution
      </Typography>

      {colorData.length > 0 ? (
        <Box>
          <Box
            sx={{
              width: "100%",
              overflowX: "hidden",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height={isSmallMobile ? 150 : isMobile ? 200 : 300}
              minWidth={250}
            >
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Pie
                  data={colorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={
                    isMobile
                      ? false
                      : ({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={isSmallMobile ? 45 : isMobile ? 60 : 80}
                  innerRadius={isSmallMobile ? 15 : isMobile ? 20 : 25}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={isMobile ? 1 : 2}
                >
                  {colorData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={isMobile ? 1 : 2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} sources`, name]}
                  labelStyle={{ fontSize: isMobile ? "12px" : "14px" }}
                  contentStyle={{
                    fontSize: isMobile ? "12px" : "14px",
                    padding: isMobile ? "4px 8px" : "8px 12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography
              variant={isMobile ? "caption" : "subtitle2"}
              gutterBottom
              sx={{
                fontSize: isMobile ? "0.8rem" : undefined,
                fontWeight: "bold",
              }}
            >
              Color Requirements Summary:
            </Typography>
            {colorData.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: isMobile ? 0.5 : 1,
                  flexWrap: isMobile ? "wrap" : "nowrap",
                }}
              >
                <Box
                  sx={{
                    width: isMobile ? 16 : 20,
                    height: isMobile ? 16 : 20,
                    backgroundColor: item.color,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    mr: isMobile ? 1 : 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "0.6rem" : "0.75rem",
                    fontWeight: "bold",
                    color: item.textColor,
                    flexShrink: 0,
                  }}
                >
                  {MANA_COLORS.find((c) => COLOR_NAMES[c] === item.name)}
                </Box>
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  sx={{ fontSize: isMobile ? "0.75rem" : undefined }}
                >
                  {item.name}: {item.value} sources (
                  {((item.value / totalMana) * 100).toFixed(1)}%)
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No mana requirements detected. This might be a colorless deck or the
            analysis needs more data.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
