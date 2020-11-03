import { Logger } from '@elo-video-chat/utils';
import { useEffect, useState } from 'react';

export const useLogger = (namespace: string) => {
  const [logger, setLogger] = useState<Logger>(null);

  useEffect(() => {
    setLogger(new Logger(namespace));
  }, [namespace]);

  return logger;
};
