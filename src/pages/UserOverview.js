import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Input,
  message,
  Popconfirm
} from 'antd';
import { 
  UserOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { db } from '../firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';

const { Text } = Typography;

export default function UserOverview({ fetchData, loading }) {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      const usersData = await fetchData('users');
      setUsers(usersData);
    };
    loadUsers();
  }, [fetchData]);

  const handleDelete = async (userId) => {
    try {
      setDeletingId(userId);
      await deleteDoc(doc(db, 'users', userId));
      message.success('User deleted successfully');
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Full Name',
      key: 'name',
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'N/A',
      sorter: (a, b) => {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: role => <Tag color={role === 'admin' ? 'red' : 'blue'}>{role || 'user'}</Tag>,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value, record) => (record.role || 'user') === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => console.log('Edit', record.id)}
            disabled={record.role === 'admin'}
          />
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={record.role === 'admin'}
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              loading={deletingId === record.id}
              disabled={record.role === 'admin'}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-overview">
      <div className="user-actions">
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300, marginBottom: 16 }}
        />
        
        <div className="stats-header">
          <Text>Total Users:</Text>
          <Text strong style={{ fontSize: 24, marginLeft: 8 }}>{users.length}</Text>
        </div>
      </div>

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: total => `Total ${total} users`,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
}