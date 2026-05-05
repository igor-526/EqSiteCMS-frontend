"use client"

import {useState} from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {Alert, Button, Form, Input} from 'antd';
import {loginCredentialsType} from "@/types/api/login";
import authApiLogin from "@/api/auth";
import { useRouter } from "next/navigation";
import { useUserContext } from '@/contexts/UserContext';


const LoginPage = () => {
    const [showError, setShowError] = useState<string | null>(null);
    const router = useRouter();
    const { refreshUser } = useUserContext();

    const onFinish = async (loginForm: loginCredentialsType) => {
        try {
            const loginStatus = await authApiLogin(loginForm);
            switch (loginStatus) {
                case "ok":
                    // Обновляем информацию о пользователе после успешного входа
                    await refreshUser();
                    router.push("/dashboard");
                    return
                case "denied":
                    setShowError("Неверный логин или пароль");
                    return
                case "error":
                    setShowError("Ошибка при входе в систему");
                    return
                default:
                    setShowError("Неизвестная ошибка");
                    return
            }
        } catch {
            setShowError("Неизвестная ошибка");
        }
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-5 shadow-lg">
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Введите логин' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Логин" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Введите пароль' }]}
                    >
                        <Input prefix={<LockOutlined />} type="password" placeholder="Пароль" />
                    </Form.Item>
                    <Form.Item>
                        <Button block type="primary" htmlType="submit">
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
                {showError && <Alert title={showError} type="error"/>}
            </div>
        </div>
    );
};

export default LoginPage;