import React from 'react';
import { AppBar, Box, Button, CssBaseline, Toolbar, Typography } from '@material-ui/core';
import '@fontsource/oswald';

const TopNav: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <AppBar position={'static'}>
        <Toolbar>
          <Typography variant="h4">
            <Box letterSpacing={5}>VELO</Box>
          </Typography>
          <Button>
            <Typography>
              <Box fontWeight={'fontWeightBold'}>White Paper</Box>
            </Typography>
          </Button>
          <Button>
            <Typography>
              <Box fontWeight={'fontWeightBold'}>Sign in</Box>
            </Typography>
          </Button>
          <Button variant="contained">
            <Typography>
              <Box fontWeight={'fontWeightBold'}>Register</Box>
            </Typography>
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopNav;
