
import React, { Component } from 'react';
import { dataSourceService } from '../services/DataSourceService';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { connect } from 'react-redux'
import { ClearCountryStat, SetCountryStat } from './../store/actions/CountryStatAction';
import { Form, Input,Select, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
const { Option } = Select;
class CountryStatContainer extends Component {
    componentDidMount() {
        this.loadData((data) => {
            console.log(this.props);
        });
    }
    loadData = (callback) => {
        forkJoin([
            dataSourceService.getCountries()
        ]
        ).pipe(
            map(([countries]) => {
                return { countries };
            })
        ).subscribe((data) => {
            this.props.SetCountryStat({
                countries: data.countries
            });
            if (callback) {
                callback(data);
            }
        });


    }
    onFinish = values => {
        console.log('Received values of form: ', values);
    }

    render() {
        return (
            <>
                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={this.onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<UserOutlined  />} placeholder="Username" />
                    </Form.Item>
           
          <Form.Item
            name={['address', 'province']}
            rules={[{ required: true, message: 'Province is required' }]}
          >
            <Select placeholder="Select province">
              <Option value="Zhejiang">Zhejiang</Option>
              <Option value="Jiangsu">Jiangsu</Option>
            </Select>
          </Form.Item>

 
                </Form>
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        CountryStat: state.CountryStatReducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        SetCountryStat: (state) => {
            dispatch(SetCountryStat(state))
        },
        ClearCountryStat: () => {
            dispatch(ClearCountryStat())
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CountryStatContainer);
