import {
  Alert,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useMemo, useState } from "react";
import {
  formatAnalyticsDateRange,
  useAnalyticsDateRange,
} from "../analytics/AnalyticsDateRange";
import {
  getAnalyticsErrorMessage,
  useGetAnalyticsQuery,
} from "../analytics/analyticsApi";

const EMPTY_ROWS = [];
const MAX_VISIBLE_ROWS = 100;

const tableCellSx = {
  whiteSpace: "nowrap",
  backgroundColor: "#18181c",
  borderColor: "#2b2b31",
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".04em",
  textTransform: "uppercase",
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(Number(value || 0)));
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatPosition(value) {
  const position = Number(value || 0);
  return position ? position.toFixed(1) : "—";
}

function formatSearchConsoleDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return "the latest available date";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function MetricCard({ label, value, helper, icon }) {
  return (
    <Paper
      className="rounded-14 p-20"
      elevation={0}
      sx={{ backgroundColor: "background.paper", border: "1px solid #27272a" }}
    >
      <Box className="flex items-start justify-between gap-16">
        <Box>
          <Typography
            className="text-11 font-bold uppercase tracking-wide"
            color="text.secondary"
          >
            {label}
          </Typography>
          <Typography className="mt-12 text-28 font-extrabold leading-none">
            {value}
          </Typography>
        </Box>
        <Box
          aria-hidden="true"
          className="h-38 w-38 flex shrink-0 items-center justify-center rounded-8"
          sx={{
            backgroundColor: "rgba(201, 162, 39, .13)",
            color: "primary.light",
          }}
        >
          <FuseSvgIcon size={20}>{icon}</FuseSvgIcon>
        </Box>
      </Box>
      <Typography
        className="mt-14 text-12 leading-relaxed"
        color="text.secondary"
      >
        {helper}
      </Typography>
    </Paper>
  );
}

function SearchReportTable({ title, description, rows, primaryKey, query }) {
  const visibleRows = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            !query ||
            String(row[primaryKey] || "")
              .toLowerCase()
              .includes(query)
        )
        .slice(0, MAX_VISIBLE_ROWS),
    [primaryKey, query, rows]
  );

  return (
    <Paper
      className="rounded-14 overflow-hidden"
      elevation={0}
      sx={{ backgroundColor: "background.paper", border: "1px solid #27272a" }}
    >
      <Box className="border-b p-20" sx={{ borderColor: "#27272a" }}>
        <Typography className="text-16 font-bold">{title}</Typography>
        <Typography className="mt-4 text-12" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader aria-label={title}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...tableCellSx, minWidth: 280 }}>
                {primaryKey === "query" ? "Query" : "Page"}
              </TableCell>
              <TableCell align="right" sx={tableCellSx}>
                Clicks
              </TableCell>
              <TableCell align="right" sx={tableCellSx}>
                Impressions
              </TableCell>
              <TableCell align="right" sx={tableCellSx}>
                CTR
              </TableCell>
              <TableCell align="right" sx={tableCellSx}>
                Position
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length ? (
              visibleRows.map((row, index) => (
                <TableRow
                  hover
                  key={`${row[primaryKey]}-${index}`}
                  sx={{ "& td": { borderColor: "#27272a" } }}
                >
                  <TableCell sx={{ minWidth: 280 }}>
                    <Typography className="break-words text-12 font-semibold">
                      {row[primaryKey]}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography className="text-12 font-bold">
                      {formatNumber(row.clicks)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography className="text-12">
                      {formatNumber(row.impressions)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography className="text-12">
                      {formatPercent(row.ctr)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography className="text-12">
                      {formatPosition(row.position)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={5}
                  sx={{ borderColor: "#27272a", py: 48 }}
                >
                  <Typography className="text-13" color="text.secondary">
                    No matching Search Console data yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > MAX_VISIBLE_ROWS ? (
        <Typography
          className="border-t px-20 py-12 text-11"
          color="text.secondary"
          sx={{ borderColor: "#27272a" }}
        >
          Showing the first {MAX_VISIBLE_ROWS} matching rows.
        </Typography>
      ) : null}
    </Paper>
  );
}

function SearchPerformancePage() {
  const { dateRange } = useAnalyticsDateRange();
  const {
    data: searchPerformance,
    error: searchError,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAnalyticsQuery({ dateRange, view: "search" });
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const overview = searchPerformance?.overview || {};
  const dataFreshness = searchPerformance?.dataFreshness;
  const isRecentDataProcessing = Boolean(dataFreshness?.isProcessing);
  const latestCompleteDate = formatSearchConsoleDate(
    dataFreshness?.latestCompleteDate
  );
  const error = getAnalyticsErrorMessage(
    searchError,
    "Unable to load Search Console data."
  );

  return (
    <FusePageSimple
      header={
        <div
          className="flex w-full flex-col justify-center border-b px-24 py-24 sm:px-40"
          style={{ borderColor: "#27272a" }}
        >
          <Box className="flex flex-wrap items-center justify-between gap-16">
            <Box>
              <Box className="flex flex-wrap items-center gap-10">
                <Typography className="text-3xl font-extrabold leading-tight">
                  Google Search performance
                </Typography>
                <Chip
                  label={`Google Search · ${formatAnalyticsDateRange(
                    searchPerformance?.dateRange || dateRange
                  )}`}
                  size="small"
                  sx={{
                    height: 24,
                    backgroundColor: "rgba(201, 162, 39, .12)",
                    border: "1px solid rgba(201, 162, 39, .25)",
                    color: "primary.light",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".04em",
                  }}
                />
                {isRecentDataProcessing ? (
                  <Chip
                    icon={<FuseSvgIcon size={14}>heroicons-outline:clock</FuseSvgIcon>}
                    label="Recent data processing"
                    size="small"
                    sx={{
                      height: 24,
                      backgroundColor: "rgba(59, 130, 246, .10)",
                      border: "1px solid rgba(59, 130, 246, .30)",
                      color: "#93c5fd",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".04em",
                      "& .MuiChip-icon": { color: "#93c5fd" },
                    }}
                  />
                ) : null}
              </Box>
              <Typography className="mt-8 text-14" color="text.secondary">
                See how people find your website through Google Search, including
                clicks, visibility, and the search terms bringing readers to you.
              </Typography>
            </Box>
            <Box className="flex items-center gap-10">
              {searchPerformance?.generatedAt ? (
                <Typography className="text-11" color="text.secondary">
                  Updated{" "}
                  {new Date(searchPerformance.generatedAt).toLocaleString()}
                </Typography>
              ) : null}
              <Tooltip
                title={
                  isFetching ? "Refreshing search data" : "Refresh search data"
                }
              >
                <span>
                  <IconButton
                    aria-label="Refresh search performance data"
                    className="h-36 w-36 border border-solid"
                    disabled={isFetching}
                    onClick={refetch}
                    size="small"
                    sx={{
                      borderColor: "rgba(201, 162, 39, .38)",
                      color: "primary.light",
                      backgroundColor: "rgba(201, 162, 39, .08)",
                      "&:hover": { backgroundColor: "rgba(201, 162, 39, .16)" },
                    }}
                  >
                    <RefreshIcon
                      className={isFetching ? "animate-spin" : ""}
                      sx={{ fontSize: 18 }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Box className="mx-auto flex w-full max-w-[1600px] flex-col gap-20">
            {isLoading ? (
              <Paper
                className="rounded-14 overflow-hidden p-20"
                elevation={0}
                sx={{
                  backgroundColor: "background.paper",
                  border: "1px solid #27272a",
                }}
              >
                <Typography className="text-14 font-semibold">
                  Loading Google Search Console
                </Typography>
                <LinearProgress className="mt-16" color="primary" />
              </Paper>
            ) : null}

            {isError ? (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" onClick={refetch} size="small">
                    Retry
                  </Button>
                }
                sx={{
                  backgroundColor: "rgba(201, 162, 39, .11)",
                  border: "1px solid rgba(201, 162, 39, .24)",
                  color: "text.primary",
                }}
              >
                {error}. Confirm that the Search Console API is enabled and the
                Analytics service account has access to this property.
              </Alert>
            ) : null}

            {isRecentDataProcessing ? (
              <Alert
                severity="info"
                sx={{
                  backgroundColor: "rgba(59, 130, 246, .10)",
                  border: "1px solid rgba(59, 130, 246, .28)",
                  color: "text.primary",
                  "& .MuiAlert-icon": { color: "#60a5fa" },
                }}
              >
                <Typography className="text-13 font-bold">
                  Recent Search Console data is still processing
                </Typography>
                <Typography className="mt-2 text-12 leading-relaxed">
                  Complete data is currently available through {latestCompleteDate}. Your
                  selected range includes newer dates, which Google normally finalizes in
                  2–3 days. Until then, recent metrics or tables can temporarily show zero.
                </Typography>
              </Alert>
            ) : null}

            <Box className="grid grid-cols-1 gap-16 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Clicks"
                value={formatNumber(overview.clicks)}
                helper={
                  isRecentDataProcessing
                    ? "Recent Google Search clicks are still being processed."
                    : "Google Search clicks in this date range."
                }
                icon="heroicons-outline:cursor-click"
              />
              <MetricCard
                label="Impressions"
                value={formatNumber(overview.impressions)}
                helper={
                  isRecentDataProcessing
                    ? "Recent impressions are still being processed."
                    : "Times your pages appeared in Google Search."
                }
                icon="heroicons-outline:eye"
              />
              <MetricCard
                label="Average CTR"
                value={formatPercent(overview.ctr)}
                helper="Clicks divided by search impressions."
                icon="heroicons-outline:chart-bar"
              />
              <MetricCard
                label="Average position"
                value={formatPosition(overview.position)}
                helper="Lower positions generally rank higher in search."
                icon="heroicons-outline:trending-up"
              />
            </Box>

            <Paper
              className="rounded-14 p-16"
              elevation={0}
              sx={{
                backgroundColor: "background.paper",
                border: "1px solid #27272a",
              }}
            >
              <TextField
                fullWidth
                aria-label="Search queries and pages"
                placeholder="Filter queries or pages…"
                size="small"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: "text.secondary", fontSize: 18 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>

            <Box className="grid grid-cols-1 gap-20 xl:grid-cols-2">
              <SearchReportTable
                title="Top queries"
                description="The search terms people used on Google to find your website."
                rows={searchPerformance?.topQueries || EMPTY_ROWS}
                primaryKey="query"
                query={normalizedQuery}
              />
              <SearchReportTable
                title="Top pages"
                description="Your website pages that appeared in Google Search results."
                rows={searchPerformance?.topPages || EMPTY_ROWS}
                primaryKey="page"
                query={normalizedQuery}
              />
            </Box>
          </Box>
        </Box>
      }
    />
  );
}

export default SearchPerformancePage;
