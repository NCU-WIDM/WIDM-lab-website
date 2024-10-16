import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://widm-back-end.nevercareu.space';

// axios.get('/api/config').then(response => {
//   const HOSTNAME = response.data.HOSTNAME;
//   API_URL = `http://${HOSTNAME}:4567`;
// });

export function getApiUrl() {
  return API_URL;
}

export const NotificationType = {
  ERROR: 'error',
  SUCCESS: 'success',
};

export const setPageTitle = (title) => {
  window.document.title = title;
};

export const showNotification = (
  message = 'Something went wrong',
  type = NotificationType.ERROR,
  description
) => {
  alert(`${type.toUpperCase()}: ${message}\n${description || ''}`);
};

export const handleErrorResponse = (
  error, // eslint-disable-line
  callback,
  errorMessage
) => {
  console.error(error);

  if (!errorMessage) {
    errorMessage = 'Something went wrong';

    if (typeof error === 'string') {
      try {
        error = JSON.parse(error);
      } catch (parseError) {
        // do nothing
      }
    }

    if (axios.isAxiosError(error) && error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }
  }

  showNotification(
    errorMessage && errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
    NotificationType.ERROR
  );

  if (callback) {
    return callback();
  }
};
