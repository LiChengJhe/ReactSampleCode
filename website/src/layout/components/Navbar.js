
import React, { Component } from 'react';
import { AppBar, Tab, Tabs } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faFlag } from '@fortawesome/free-solid-svg-icons'
import { withRouter } from 'react-router-dom';
export class Navbar extends Component {


  tabChange = (event, nextTab) => {

    this.props.history.push(nextTab);
  };

  render() {

    return (
      <>
        <AppBar position='static' >
          <Tabs value={this.props?.location?.pathname.length>1?this.props.location.pathname:'/global'} onChange={this.tabChange} >
            <Tab label='全球統計' value='/global' icon={<FontAwesomeIcon icon={faGlobe} />} />
            <Tab label='各國統計' value='/country' icon={<FontAwesomeIcon icon={faFlag} />} />
          </Tabs>
        </AppBar>
      </>
    );
  }
}
export default withRouter(Navbar);