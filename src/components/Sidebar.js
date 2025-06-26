// src/components/Sidebar.js
import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ activeTab, onChangeTab, collapsed, toggleCollapse }) => {
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={200}
      className="site-layout-background"
      breakpoint="lg"
      collapsedWidth="80"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        {!collapsed && <span className="font-semibold text-blue-600">Admin</span>}
        <span onClick={toggleCollapse} className="cursor-pointer text-xl">
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        onClick={(e) => onChangeTab(e.key)}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="users" icon={<UserOutlined />}>
          {!collapsed && 'Users'}
        </Menu.Item>
        <Menu.Item key="subjects" icon={<BookOutlined />}>
          {!collapsed && 'Subjects'}
        </Menu.Item>
        <Menu.Item key="questionPapers" icon={<FileTextOutlined />}>
          {!collapsed && 'Question Papers'}
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
