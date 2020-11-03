export const USER_MEDIA_CONFIG: MediaStreamConstraints = {
  audio: { echoCancellation: true, noiseSuppression: true },
  video: { facingMode: 'user' },
};
