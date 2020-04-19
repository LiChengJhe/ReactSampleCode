import React, { Component } from 'react';
import Content from './layout/components/Content';
import './App.css';
import { BrowserRouter, Switch } from 'react-router-dom';
import { Navbar } from './layout/components/Navbar';
import { Grid } from '@material-ui/core';


export default class App extends Component {


  render() {
    return (
      <BrowserRouter>
        <Switch>
          <>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Navbar/>
              </Grid>
              <Grid item xs={12}>
                <Content/>
              </Grid>
            </Grid>
          </ >
        </Switch>
      </BrowserRouter>
    );
  }

}


