import {
  Alert,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
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

function getPersonName(person, fallback = 'Unknown reader') {
  return person?.name || person?.displayName || person?.userName || fallback;
}

function getPersonEmail(person) {
  return person?.email || person?.userEmail || 'No email';
}

function normalizeLookupValue(value) {
  return String(value || '').trim().toLowerCase();
}

function firstTextValue(values) {
  return (
    values.find((value) => typeof value === 'string' && value.trim())?.trim() ||
    ''
  );
}

function getPersonAvatar(person) {
  if (!person) return '';

  return firstTextValue([
    person.photoURL,
    person.photoUrl,
    person.googlePhotoURL,
    person.googlePhotoUrl,
    person.googlePicture,
    person.picture,
    person.photo,
    person.imageUrl,
    person.avatarUrl,
    person.avatar,
    person.profilePhotoUrl,
    person.profileImageUrl,
    person.google?.photoURL,
    person.google?.picture,
    person.providerData?.[0]?.photoURL,
  ]);
}

function getFeedbackAvatar(item, sender) {
  return firstTextValue([
    getPersonAvatar(sender),
    item?.userPhotoURL,
    item?.userPhotoUrl,
    item?.userPicture,
    item?.userPhoto,
    item?.userImageUrl,
    getPersonAvatar(item),
  ]);
}

function getInitials(name, email) {
  const source = String(name || email || 'Reader').trim();
  const parts = source.includes('@')
    ? [source.charAt(0)]
    : source.split(/\s+/).slice(0, 2);

  return parts
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

function formatLabel(value, fallback = 'General') {
  const label = String(value || fallback)
    .replace(/[_-]+/g, ' ')
    .trim();

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatFeedbackStatus(value) {
  const normalizedStatus = String(value || '')
    .toLowerCase()
    .replace(/-/g, '_');

  if (!normalizedStatus || normalizedStatus === 'new') {
    return 'Pending';
  }

  if (normalizedStatus === 'reviewed') {
    return 'Reviewed';
  }

  return formatLabel(value, 'Pending');
}

function formatRating(value) {
  const rating = Number(value || 0);

  if (!Number.isFinite(rating) || rating <= 0) {
    return 'No rating';
  }

  return `${Math.min(5, rating).toFixed(rating % 1 ? 1 : 0)}/5`;
}

function formatPageUrl(value) {
  if (!value) return '';

  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}` || url.href;
  } catch {
    return String(value);
  }
}

function statusChipSx(status) {
  const normalizedStatus = String(status || '')
    .toLowerCase()
    .replace(/-/g, '_');

  if (['resolved', 'closed', 'done'].includes(normalizedStatus)) {
    return {
      backgroundColor: 'rgba(34, 197, 94, .12)',
      borderColor: 'rgba(34, 197, 94, .26)',
      color: '#86efac',
    };
  }

  if (
    ['reviewed', 'reviewing', 'in_progress', 'progress'].includes(
      normalizedStatus
    )
  ) {
    return {
      backgroundColor: 'rgba(59, 130, 246, .12)',
      borderColor: 'rgba(59, 130, 246, .26)',
      color: '#93c5fd',
    };
  }

  return {
    backgroundColor: 'rgba(201, 162, 39, .13)',
    borderColor: 'rgba(201, 162, 39, .26)',
    color: 'primary.light',
  };
}

function findFeedbackSender(item, usersById, usersByEmail) {
  return (
    usersById.get(normalizeLookupValue(item?.userId)) ||
    usersByEmail.get(normalizeLookupValue(item?.userEmail)) ||
    null
  );
}

function FeedbackCard({ item, sender, isDeleting, onDelete }) {
  const subject = item.subject || 'Untitled feedback';
  const category = formatLabel(item.category);
  const status = formatFeedbackStatus(item.status);
  const userName = getPersonName(sender, item.userName || 'Unknown reader');
  const userEmail = getPersonEmail(sender || item);
  const avatar = getFeedbackAvatar(item, sender);
  const pageUrl = formatPageUrl(item.pageUrl);

  return (
    <Paper
      className="rounded-10 px-16 py-16"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(20, 20, 25, .72)',
        border: '1px solid rgba(255,255,255,.08)',
        boxShadow: '0 16px 36px rgba(0,0,0,.16)',
      }}
    >
      <Box className="flex gap-14">
        <Avatar
          alt={userName}
          className="h-44 w-44 shrink-0 text-13 font-bold"
          src={avatar}
          sx={{
            backgroundColor: 'rgba(201, 162, 39, .16)',
            border: '1px solid rgba(201, 162, 39, .32)',
            color: 'primary.light',
          }}
        >
          {getInitials(userName, userEmail)}
        </Avatar>

        <Box className="min-w-0 flex-1">
          <Box className="flex items-start justify-between gap-12">
            <Box className="min-w-0">
              <Box className="flex flex-wrap items-center gap-x-8 gap-y-5">
                <Typography className="truncate text-13 font-extrabold">
                  {userName}
                </Typography>
                <Typography
                  className="hidden text-11 sm:block"
                  color="text.secondary"
                >
                  {userEmail}
                </Typography>
                <Typography className="text-11" color="text.secondary">
                  {formatDate(item.createdAt)}
                </Typography>
              </Box>
              <Typography className="mt-8 text-17 font-extrabold leading-snug">
                {subject}
              </Typography>
            </Box>

            <Tooltip title="Delete feedback">
              <span>
                <IconButton
                  aria-label={`Delete ${subject}`}
                  className="h-32 w-32 shrink-0"
                  disabled={isDeleting}
                  onClick={() => onDelete(item)}
                  size="small"
                  sx={{
                    border: '1px solid rgba(248, 113, 113, .24)',
                    color: '#fca5a5',
                    '&:hover': {
                      backgroundColor: 'rgba(248, 113, 113, .1)',
                      borderColor: 'rgba(248, 113, 113, .42)',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Typography className="mt-10 whitespace-pre-wrap text-13 leading-relaxed">
            {item.message || 'No message provided.'}
          </Typography>

          <Box className="mt-14 flex flex-wrap items-center gap-8">
            <Chip
              label={category}
              size="small"
              sx={{
                height: 24,
                backgroundColor: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                color: 'text.primary',
                fontSize: 11,
                fontWeight: 700,
              }}
            />
            <Chip
              label={status}
              size="small"
              sx={{
                height: 24,
                border: '1px solid',
                fontSize: 11,
                fontWeight: 800,
                ...statusChipSx(item.status),
              }}
            />
            <Box
              className="flex h-24 items-center gap-4 rounded-full px-8"
              sx={{
                backgroundColor: 'rgba(251, 191, 36, .1)',
                border: '1px solid rgba(251, 191, 36, .22)',
                color: '#facc15',
              }}
            >
              <StarRoundedIcon sx={{ fontSize: 15 }} />
              <Typography className="text-11 font-extrabold">
                {formatRating(item.rating)}
              </Typography>
            </Box>
            {pageUrl ? (
              <Typography
                className="min-w-0 max-w-full truncate text-11"
                color="text.secondary"
              >
                {pageUrl}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function UsersFeedbackPage() {
  const { data, error, isFetching, isLoading, refetch } =
    useGetAdminUsersQuery();
  const [deleteFeedback, { error: deleteError, isLoading: isDeleting }] =
    useDeleteFeedbackMutation();
  const [query, setQuery] = useState('');
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const normalizedQuery = query.trim().toLowerCase();
  const users = Array.isArray(data?.users) ? data.users : [];
  const feedback = Array.isArray(data?.feedback) ? data.feedback : [];
  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      const id = normalizeLookupValue(user.id);
      if (id) map.set(id, user);
    });
    return map;
  }, [users]);
  const usersByEmail = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      const email = normalizeLookupValue(user.email);
      if (email) map.set(email, user);
    });
    return map;
  }, [users]);
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        if (!normalizedQuery) return true;
        return `${getPersonName(user)} ${getPersonEmail(user)}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [normalizedQuery, users]
  );
  const filteredFeedback = useMemo(
    () =>
      feedback.filter((item) => {
        if (!normalizedQuery) return true;
        return `${item.userName} ${item.userEmail} ${item.subject} ${item.message} ${item.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [feedback, normalizedQuery]
  );
  const pageError = getAdminApiErrorMessage(
    error,
    'Unable to load users and feedback.'
  );
  const removeError = getAdminApiErrorMessage(
    deleteError,
    'Unable to delete feedback.'
  );

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
        <div
          className="flex w-full flex-col justify-center border-b px-24 py-24 sm:px-40"
          style={{ borderColor: '#27272a' }}
        >
          <Box className="flex flex-wrap items-center justify-between gap-16">
            <Box>
              <Typography className="text-3xl font-extrabold leading-tight">
                Users and feedback
              </Typography>
              <Typography className="mt-8 text-14" color="text.secondary">
                ReadAlQuran account activity, Quran state, and reader feedback.
              </Typography>
            </Box>
            <Tooltip title={isFetching ? 'Refreshing users' : 'Refresh users and feedback'}>
              <span>
                <IconButton
                  aria-label="Refresh users and feedback"
                  className="h-36 w-36 border border-solid"
                  disabled={isFetching}
                  onClick={refetch}
                  size="small"
                  sx={{
                    borderColor: 'rgba(201, 162, 39, .38)',
                    color: 'primary.light',
                    backgroundColor: 'rgba(201, 162, 39, .08)',
                    '&:hover': {
                      backgroundColor: 'rgba(201, 162, 39, .16)',
                      borderColor: 'rgba(201, 162, 39, .58)',
                    },
                    '&.Mui-disabled': {
                      borderColor: 'rgba(201, 162, 39, .2)',
                      color: 'rgba(201, 162, 39, .45)',
                    },
                  }}
                >
                  <RefreshIcon
                    className={isFetching ? 'animate-spin' : ''}
                    sx={{ fontSize: 18 }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Box className="mx-auto flex w-full max-w-[1440px] flex-col gap-20">
            {isLoading ? <LinearProgress /> : null}
            {error ? <Alert severity="warning">{pageError}</Alert> : null}
            <TextField
              label="Search readers or feedback"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              fullWidth
            />

            <Paper
              className="rounded-14 overflow-hidden"
              elevation={0}
              sx={{
                backgroundColor: 'background.paper',
                border: '1px solid #27272a',
              }}
            >
              <Box
                className="border-b px-20 py-16"
                sx={{ borderColor: '#27272a' }}
              >
                <Typography className="text-16 font-bold">
                  Readers ({filteredUsers.length})
                </Typography>
              </Box>
              <Box className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left">
                  <thead className="text-zinc-400 bg-white/[0.025] text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-20 py-12">Reader</th>
                      <th className="px-20 py-12">Joined</th>
                      <th className="px-20 py-12">Last login</th>
                      <th className="px-20 py-12">Visits</th>
                      <th className="px-20 py-12">Website time</th>
                      <th className="px-20 py-12">Audio time</th>
                      <th className="px-20 py-12">Saved Quran state</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const readerName = getPersonName(user);
                      const readerEmail = getPersonEmail(user);
                      const readerAvatar = getPersonAvatar(user);

                      return (
                        <tr
                          key={user.id}
                          className="border-t"
                          style={{ borderColor: '#27272a' }}
                        >
                          <td className="px-20 py-14">
                            <Box className="flex items-center gap-12">
                              <Avatar
                                alt={readerName}
                                className="h-40 w-40 shrink-0 text-13 font-bold"
                                src={readerAvatar}
                                sx={{
                                  backgroundColor: 'rgba(201, 162, 39, .16)',
                                  border: '1px solid rgba(201, 162, 39, .28)',
                                  color: 'primary.light',
                                }}
                              >
                                {getInitials(readerName, readerEmail)}
                              </Avatar>
                              <Box className="min-w-0">
                                <Typography className="truncate text-13 font-semibold">
                                  {readerName}
                                </Typography>
                                <Typography
                                  className="mt-2 truncate text-11"
                                  color="text.secondary"
                                >
                                  {readerEmail}
                                </Typography>
                              </Box>
                            </Box>
                          </td>
                          <td className="px-20 py-14 text-12">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-20 py-14 text-12">
                            {formatDate(user.lastLoginAt)}
                          </td>
                          <td className="px-20 py-14 text-12">
                            {user.loginCount || 0}
                          </td>
                          <td className="px-20 py-14 text-12">
                            {formatDuration(user.totalSessionSeconds)}
                          </td>
                          <td className="px-20 py-14 text-12">
                            {formatDuration(user.totalAudioSeconds)}
                          </td>
                          <td className="px-20 py-14 text-12">
                            {(user.favoriteSurahIds || []).length} favourites ·{' '}
                            {(user.bookmarkedAyahs || []).length} bookmarks
                          </td>
                        </tr>
                      );
                    })}
                    {!filteredUsers.length ? (
                      <tr>
                        <td
                          className="text-zinc-400 px-20 py-20 text-sm"
                          colSpan="7"
                        >
                          No matching readers yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </Box>
            </Paper>

            <Box className="mt-4">
              <Box className="mb-14 flex flex-wrap items-end justify-between gap-12">
                <Box>
                  <Typography className="text-18 font-extrabold">
                    Feedback inbox
                  </Typography>
                  <Typography className="mt-4 text-12" color="text.secondary">
                    {filteredFeedback.length} showing from {feedback.length}{' '}
                    total reader messages.
                  </Typography>
                </Box>
                <Chip
                  label={`${filteredFeedback.length} feedback`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(201, 162, 39, .13)',
                    border: '1px solid rgba(201, 162, 39, .26)',
                    color: 'primary.light',
                    fontWeight: 800,
                  }}
                />
              </Box>
              {deleteError ? (
                <Alert className="m-16" severity="error">
                  {removeError}
                </Alert>
              ) : null}
              <Box className="grid grid-cols-1 gap-14 xl:grid-cols-2">
                {filteredFeedback.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    item={item}
                    sender={findFeedbackSender(item, usersById, usersByEmail)}
                    isDeleting={isDeleting}
                    onDelete={setFeedbackToDelete}
                  />
                ))}
              </Box>
              {!filteredFeedback.length ? (
                <Paper
                  className="rounded-10 px-20 py-24"
                  elevation={0}
                  sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid #27272a',
                  }}
                >
                  <Typography className="text-sm" color="text.secondary">
                    No matching feedback yet.
                  </Typography>
                </Paper>
              ) : null}
            </Box>

            <Dialog
              open={Boolean(feedbackToDelete)}
              onClose={() => !isDeleting && setFeedbackToDelete(null)}
            >
              <DialogTitle>Delete feedback?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This permanently removes this reader feedback entry.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  disabled={isDeleting}
                  onClick={() => setFeedbackToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  color="error"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      }
    />
  );
}

export default UsersFeedbackPage;
