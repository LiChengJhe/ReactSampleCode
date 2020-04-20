import React from 'react';
import './App.css';
import Navbar  from './layout/components/Navbar';
import { Grid } from '@material-ui/core';
import { Content } from './layout/components/Content';
import 'antd/dist/antd.css'; 
import 'antd/es/date-picker/style/css';
export  function App() {
    return (
      
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Navbar />
              </Grid>
              <Grid item xs={12}>
                <Content />
              </Grid>
            </Grid>
    
    );
}



