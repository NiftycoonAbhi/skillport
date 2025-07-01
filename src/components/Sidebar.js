import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const RESOURCE_TYPES = {
  USERS: "users",
  QUESTION_PAPERS: "questionPapers",
  SUBJECTS: "subjects",
  JOBS: "jobs",
};

const Sidebar = ({ activeTab, onChangeTab, collapsed, toggleCollapse }) => {
  // Define menu items using the new items API
  const menuItems = [
    {
      key: RESOURCE_TYPES.USERS,
      icon: <UserOutlined />,
      label: !collapsed ? 'User Management' : null,
    },
    {
      key: RESOURCE_TYPES.SUBJECTS,
      icon: <BookOutlined />,
      label: !collapsed ? 'Subject Management' : null,
    },
    {
      key: RESOURCE_TYPES.QUESTION_PAPERS,
      icon: <FileTextOutlined />,
      label: !collapsed ? 'Question Papers' : null,
    },
    {
      key: RESOURCE_TYPES.JOBS,
      icon: <TeamOutlined />,
      label: !collapsed ? 'Jobs Management' : null,
    }
  ];

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
        items={menuItems} // Using the new items prop instead of children
      />
    </Sider>
  );
};

export default Sidebar;