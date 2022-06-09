import { Box, Button, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { FormEvent } from 'react';

const useStyle = makeStyles((theme) => ({
  form: {
    border: '1px solid #bdbdbd',
  },
  title: {
    color: '#4f4f4f',
    padding: theme.spacing(1),
    fontSize: '2rem',
  },
  field: {
    paddingLeft: theme.spacing(3),
  },
  registerButton: {
    margin: theme.spacing(4),
    padding: '8px 160px',
    color: '#ffffff',
    textTransform: 'none',
    backgroundColor: '#828282',
    '&:hover': {
      backgroundColor: '#767676',
    },
  },
}));

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
};

const Register: React.FC = () => {
  const classes = useStyle();

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Container maxWidth={'md'}>
          <Box borderRadius={16} className={classes.form}>
            <Grid container justify={'center'}>
              <Typography variant={'h3'} className={classes.title}>
                <Box fontWeight={700}>Registration Form</Box>
              </Typography>
            </Grid>
            <Grid container>
              {/*    name */}
              <Grid item xs={4} className={classes.field}>
                <p>name</p>*
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
              {/*    full name*/}
              <Grid item xs={4} className={classes.field}>
                <p>full name</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
              {/*    company/organization*/}
              <Grid item xs={4} className={classes.field}>
                <p>Company/organization</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
            {/*    field*/}
            <Grid container>
              <Grid item xs={4} className={classes.field}>
                <p>xxxxxxxxx</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
            {/*    field*/}
            <Grid container>
              <Grid item xs={4} className={classes.field}>
                <p>xxxxxxxxx</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
            {/*    field*/}
            <Grid container>
              <Grid item xs={4} className={classes.field}>
                <p>xxxxxxxxx</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
            {/*    field*/}
            <Grid container>
              <Grid item xs={4} className={classes.field}>
                <p>xxxxxxxxx</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
            {/*    field*/}
            <Grid container>
              <Grid item xs={4} className={classes.field}>
                <p>xxxxxxxxx</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
            {/*    field*/}
            <Grid container>
              <Grid item xs={4} className={classes.field}>
                <p>xxxxxxxxx</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
            {/*    field*/}
            <Grid container>
              <Grid item xs={4} className={classes.field}>
                <p>xxxxxxxxx</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
            {/*    field*/}
            <Grid container>
              <Grid item xs={4} className={classes.field}>
                <p>xxxxxxxxx</p>
              </Grid>
              <Grid item xs={8} className={classes.field}>
                <p>xxxxxxxxxxx</p>
              </Grid>
            </Grid>
          </Box>

          <Grid container justify={'center'}>
            <Button variant={'contained'} type={'submit'} className={classes.registerButton}>
              <Typography>
                <Box>Register</Box>
              </Typography>
            </Button>
          </Grid>
        </Container>
      </form>
    </>
  );
};

export default Register;
