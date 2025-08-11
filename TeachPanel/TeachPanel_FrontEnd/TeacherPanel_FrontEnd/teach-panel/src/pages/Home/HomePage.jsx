import { useSelector } from 'react-redux';
import { Layout, Spin } from 'antd';

const { Content } = Layout;

const HomePage = () => {
    const userData = useSelector((state) => state.auth);

    return (
        <Content style={{ padding: '24px' }}>
            <Spin spinning={userData.status === 'loading'} delay={500}>
                <h2>{userData?.user.fullName}</h2>
                <p>Well CUM to the home page!</p>
            </Spin>
        </Content>
    );
};

export default HomePage;
