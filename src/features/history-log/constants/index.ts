export enum ActivityType {
  Download = 'download',
  Upload = 'upload',
  ManageOrderBook = 'manage_order_book',
  ManagePool = 'manage_pool',
  ManageUser = 'manage_user',
  ManageAdmin = 'manage_admin',
}
export const ActivityList = [
  {
    value: null,
    label: 'All',
  },
  {
    value: 'download',
    label: 'Download',
  },
  {
    value: 'upload',
    label: 'Upload',
  },
  {
    value: 'manage_order_book',
    label: 'Manage order book',
  },
  {
    value: 'manage_pool',
    label: 'Manage pool',
  },
  {
    value: 'manage_user',
    label: 'Manage user',
  },
  {
    value: 'manage_admin',
    label: 'Manage admin',
  },
];
