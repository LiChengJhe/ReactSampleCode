
import React from 'react';
import { AppBar, Tab, Tabs } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faFlag } from '@fortawesome/free-solid-svg-icons'
import { withRouter } from 'react-router-dom';

export function Navbar(props) {

  const pathName = props?.location?.pathname.length > 1 ? props.location.pathname : '/global';

  const tabChange = (event, nextTab) => {

    props.history.push(nextTab);
  };

  return (
    <>
      <AppBar position='static' >
        <Tabs value={pathName} onChange={tabChange} >
          <Tab label='全球統計' value='/global' icon={<FontAwesomeIcon icon={faGlobe} />} />
          <Tab label='各國統計' value='/country' icon={<FontAwesomeIcon icon={faFlag} />} />
        </Tabs>
      </AppBar>
    </>
  );
}

export default withRouter(Navbar);