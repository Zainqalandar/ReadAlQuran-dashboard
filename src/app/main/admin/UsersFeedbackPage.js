import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, LinearProgress, Paper, TextField, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useMemo, useState } from 'react';
import {
  getAdminApiErrorMessage,
  useDeleteFeedbackMutation,
  useGetAdminUsersQuery,
} from './adminApi';

function formatDate(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
}

function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function UsersFeedbackPage() {
  const { data, error, isFetching, isLoading, refetch } = useGetAdminUsersQuery();
  const [deleteFeedback, { error: deleteError, isLoading: isDeleting }] = useDeleteFeedbackMutation();
  const [query, setQuery] = useState('');
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const normalizedQuery = query.trim().toLowerCase();
  const users = Array.isArray(data?.users) ? data.users : [];
  const feedback = Array.isArray(data?.feedback) ? data.feedback : [];
  const filteredUsers = useMemo(() => users.filter((user) => {
    if (!normalizedQuery) return true;
    return `${user.name} ${user.email}`.toLowerCase().includes(normalizedQuery);
  }), [normalizedQuery, users]);
  const filteredFeedback = useMemo(() => feedback.filter((item) => {
    if (!normalizedQuery) return true;
    return `${item.userName} ${item.userEmail} ${item.subject} ${item.message} ${item.category}`.toLowerCase().includes(normalizedQuery);
  }), [feedback, normalizedQuery]);
  const pageError = getAdminApiErrorMessage(error, 'Unable to load users and feedback.');
  const removeError = getAdminApiErrorMessage(deleteError, 'Unable to delete feedback.');

  const confirmDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      await deleteFeedback(feedbackToDelete.id).unwrap();
      setFeedbackToDelete(null);
    } catch {
      // The API error is rendered beneath the feedback list.
    }
  };

  return (
    <FusePageSimple
      header={
        <div className="flex w-full flex-col justify-center border-b px-24 py-24 sm:px-40" style={{ borderColor: '#27272a' }}>
          <Box className="flex flex-wrap items-center justify-between gap-16">
            <Box>
              <Typography className="text-3xl font-extrabold leading-tight">Users and feedback</Typography>
              <Typography className="mt-8 text-14" color="text.secondary">Al-Huda account activity, Quran state, and reader feedback.</Typography>
            </Box>
            <Button startIcon={<RefreshIcon />} variant="outlined" disabled={isFetching} onClick={refetch}>Refresh</Button>
          </Box>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Box className="mx-auto flex w-full max-w-[1440px] flex-col gap-20">
            {isLoading ? <LinearProgress /> : null}
            {error ? <Alert severity="warning">{pageError}</Alert> : null}
            <TextField label="Search readers or feedback" value={query} onChange={(event) => setQuery(event.target.value)} fullWidth />

            <Paper className="overflow-hidden rounded-14" elevation={0} sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}>
              <Box className="border-b px-20 py-16" sx={{ borderColor: '#27272a' }}>
                <Typography className="text-16 font-bold">Readers ({filteredUsers.length})</Typography>
              </Box>
              <Box className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left">
                  <thead className="bg-white/[0.025] text-xs uppercase tracking-wide text-zinc-400">
                    <tr><th className="px-20 py-12">Reader</th><th className="px-20 py-12">Joined</th><th className="px-20 py-12">Last login</th><th className="px-20 py-12">Visits</th><th className="px-20 py-12">Website time</th><th className="px-20 py-12">Audio time</th><th className="px-20 py-12">Saved Quran state</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => <tr key={user.id} className="border-t" style={{ borderColor: '#27272a' }}>
                      <td className="px-20 py-14"><Typography className="text-13 font-semibold">{user.name}</Typography><Typography className="mt-2 text-11" color="text.secondary">{user.email}</Typography></td>
                      <td className="px-20 py-14 text-12">{formatDate(user.createdAt)}</td><td className="px-20 py-14 text-12">{formatDate(user.lastLoginAt)}</td><td className="px-20 py-14 text-12">{user.loginCount || 0}</td><td className="px-20 py-14 text-12">{formatDuration(user.totalSessionSeconds)}</td><td className="px-20 py-14 text-12">{formatDuration(user.totalAudioSeconds)}</td>
                      <td className="px-20 py-14 text-12">{(user.favoriteSurahIds || []).length} favourites · {(user.bookmarkedAyahs || []).length} bookmarks</td>
                    </tr>)}
                    {!filteredUsers.length ? <tr><td className="px-20 py-20 text-sm text-zinc-400" colSpan="7">No matching readers yet.</td></tr> : null}
                  </tbody>
                </table>
              </Box>
            </Paper>

            <Paper className="overflow-hidden rounded-14" elevation={0} sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}>
              <Box className="border-b px-20 py-16" sx={{ borderColor: '#27272a' }}><Typography className="text-16 font-bold">Feedback ({filteredFeedback.length})</Typography></Box>
              {deleteError ? <Alert className="m-16" severity="error">{removeError}</Alert> : null}
              <Box className="divide-y" sx={{ borderColor: '#27272a' }}>
                {filteredFeedback.map((item) => <Box key={item.id} className="flex gap-16 px-20 py-18">
                  <Box className="min-w-0 flex-1"><Box className="flex flex-wrap items-center gap-8"><Typography className="text-14 font-bold">{item.subject}</Typography><Typography className="rounded-full bg-white/[0.08] px-8 py-3 text-10 font-bold uppercase">{item.category}</Typography><Typography className="text-11" color="text.secondary">{item.rating}/5 · {item.status}</Typography></Box><Typography className="mt-8 whitespace-pre-wrap text-13 leading-relaxed">{item.message}</Typography><Typography className="mt-10 text-11" color="text.secondary">{item.userName} · {item.userEmail} · {formatDate(item.createdAt)}{item.pageUrl ? ` · ${item.pageUrl}` : ''}</Typography></Box>
                  <Tooltip title="Delete feedback"><span><IconButton aria-label={`Delete ${item.subject}`} disabled={isDeleting} onClick={() => setFeedbackToDelete(item)} size="small"><DeleteIcon fontSize="small" /></IconButton></span></Tooltip>
                </Box>)}
                {!filteredFeedback.length ? <Typography className="block px-20 py-20 text-sm" color="text.secondary">No matching feedback yet.</Typography> : null}
              </Box>
            </Paper>

            <Dialog open={Boolean(feedbackToDelete)} onClose={() => !isDeleting && setFeedbackToDelete(null)}>
              <DialogTitle>Delete feedback?</DialogTitle>
              <DialogContent><DialogContentText>This permanently removes this reader feedback entry.</DialogContentText></DialogContent>
              <DialogActions><Button disabled={isDeleting} onClick={() => setFeedbackToDelete(null)}>Cancel</Button><Button color="error" disabled={isDeleting} onClick={confirmDelete}>{isDeleting ? 'Deleting...' : 'Delete'}</Button></DialogActions>
            </Dialog>
          </Box>
        </Box>
      }
    />
  );
}

export default UsersFeedbackPage;
