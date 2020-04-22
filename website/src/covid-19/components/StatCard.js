import React, { Component } from "react";
import { Statistic, Card, Row, Col,Space } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown,faSmile,faDizzy } from '@fortawesome/free-solid-svg-icons'
export default class StatCard extends Component {
  render() {
    return (
      <>

        <Row justify='center' gutter={[48,48]}  style={{ width: '100vw' ,marginTop:'10px'}}>
          <Col span={4}>
            <Card>
              <Statistic
                title="確診"
                value={this.props?.stat?.confirmed}
                valueStyle={{ color: "#006699",fontSize:'36px' }}
                prefix={<FontAwesomeIcon icon={faFrown} />}
                suffix="(總)"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="治癒"
                value={this.props?.stat?.recovered}
                valueStyle={{ color: "#00cc66",fontSize:'36px' }}
                prefix={<FontAwesomeIcon icon={faSmile} />}
                suffix="(總)"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="死亡"
                value={this.props?.stat?.deaths}
                valueStyle={{ color: "#ff3300",fontSize:'36px' }}
                prefix={<FontAwesomeIcon icon={faDizzy} />}
                suffix="(總)"
              />
            </Card>
          </Col>
        </Row>

      </>
    );
  }
}
