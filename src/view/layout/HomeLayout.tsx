import styles from './HomeLayout.module.scss'
import { Button, Layout} from 'antd';
import React, {useState} from 'react';
import logo from "../../assets/logo/logo.jpeg";
import {Outlet} from "react-router-dom"
import MainMenu from "../../components/MainMenu";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from "@ant-design/icons";

const {Header, Sider, Footer, Content} = Layout;



const HomeLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout  id='components-layout-custom-trigger'>
            {/*控制左边菜单栏的宽度*/}
            <Sider collapsed={collapsed} width={210}>
                <div className={styles.sidebar_logo}>
                    <img className={styles.logo_img} src={logo} alt="没图片"/>
                </div>
                <MainMenu/>
            </Sider>

            <Layout className="site-layout">

                <Header className="site-layout-background" >

                    <div className="collapse-breadcrumb">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '8px',
                                width: 32,
                                height: 32,
                            }}
                        />
                    </div>


                </Header>

                <Content
                    className="site-layout-background"
                    style={{
                        // margin: '0px 0px',
                        // padding: 0,
                        minHeight: 280,
                        flexGrow: 1
                    }}
                >
                    <Outlet/>

                </Content>
                <Footer style={{textAlign: 'center', padding: '0', lineHeight: '48px'}}>Manage Man ©2023</Footer>
            </Layout>
        </Layout>
    );
};

export default HomeLayout;
