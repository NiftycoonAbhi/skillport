import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const RESOURCE_TYPES = {
  USERS: "users",
  QUESTION_PAPERS: "questionPapers",
  SUBJECTS: "subjects",
  JOBS: "jobs",
  CERTIFICATES: "certificates"
};

const Sidebar = ({ activeTab, onChangeTab, collapsed, toggleCollapse }) => {
  // Define menu items using the new items API
  const menuItems = [
    {
      key: RESOURCE_TYPES.USERS,
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: RESOURCE_TYPES.SUBJECTS,
      icon: <BookOutlined />,
      label: 'Subject Management',
    },
    {
      key: RESOURCE_TYPES.QUESTION_PAPERS,
      icon: <FileTextOutlined />,
      label: 'Question Papers',
    },
    {
      key: RESOURCE_TYPES.JOBS,
      icon: <TeamOutlined />,
      label: 'Jobs Management',
    },
    {
      key: RESOURCE_TYPES.CERTIFICATES,
      icon: <UploadOutlined />,
      label: 'Certificate Management',
    }
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={250}
      className="site-layout-background"
      breakpoint="lg"
      collapsedWidth={80}
      theme="light"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        {!collapsed && (
          <span className="font-semibold text-blue-600 text-lg">Admin Panel</span>
        )}
        <span 
          onClick={toggleCollapse} 
          className="cursor-pointer text-gray-600 hover:text-blue-500 transition-colors"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
      </div>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[activeTab]}
        onClick={({ key }) => onChangeTab(key)}
        style={{ height: 'calc(100% - 48px)', borderRight: 0 }}
        items={menuItems.map(item => ({
          ...item,
          label: collapsed ? null : item.label,
        }))}
      />
    </Sider>
  );
};

export default Sidebar;