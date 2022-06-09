export enum LOCKED_STATUS {
  LOCKED,
  UNLOCKED,
}

export const ADMIN_STATUS = [
  { value: null, label: 'All' },
  { value: LOCKED_STATUS.UNLOCKED, label: 'Active' },
  { value: LOCKED_STATUS.LOCKED, label: 'Disabled' },
];

export const TITLE = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Ms.', label: 'Ms.' },
];
export const renderStatus = (status: number): string | undefined => {
  switch (status) {
    case ADMIN_STATUS[1].value:
      return 'Disabled';
    case ADMIN_STATUS[2].value:
      return 'Activate';
    default:
      break;
  }
};
