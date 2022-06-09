import routeConstants from 'src/constants/routeConstants';
export const authRoutes = [
  routeConstants.SIGN_IN,
  routeConstants.FORGOT_PASSWORD,
  routeConstants.MAIN_TAIN,
  routeConstants.NOT_FOUND,
];
export const notNavBar = [routeConstants.MAIN_TAIN, routeConstants.NOT_FOUND];
export const checkAuthRoute = (route: string): boolean => {
  return !(authRoutes.filter((item) => route.indexOf(item) !== -1).length > 0);
};
export const checkNotNavBar = (route: string): boolean => {
  return notNavBar.filter((item) => route.indexOf(item) !== -1).length > 0;
};
