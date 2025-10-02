import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { Link } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = (values) => {
        setLoading(true);
        // Simulate login logic
        setTimeout(() => {
            setLoading(false);
            message.success(`Welcome, ${values.username}!`);
            // Redirect or further logic here
        }, 1000);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Card title="Admin" style={{ width: 350 }}>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input placeholder="Username" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        
                        {/* <Button type="primary" htmlType="submit" loading={loading} block> */}
                        <Button type="primary">
                           <Link to="/"> Login</Link>
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;