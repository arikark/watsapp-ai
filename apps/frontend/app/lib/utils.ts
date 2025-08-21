import type { RequestStatus } from '@workspace/types';
import dayjs from 'dayjs';

export const isOlderThan3DayAndPending = (
  date: string | undefined,
  introductionStatus: RequestStatus | undefined
) => {
  if (!date || !introductionStatus) return false;
  return (
    dayjs().diff(dayjs(date), 'day') >= 3 && introductionStatus === 'pending'
  );
};
