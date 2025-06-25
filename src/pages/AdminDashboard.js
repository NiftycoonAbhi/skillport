import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Card, 
  Typography, 
  Spin, 
  Alert, 
  Button, 
  Table, 
  Form, 
  Input, 
  Select, 
  Modal, 
  message, 
  Tag, 
  Space,
  Tabs,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LinkOutlined,
  UserOutlined,
  FileTextOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import QuestionPaperUpload from '../pages/QuestionPaperUpload';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const RESOURCE_TYPES = {
  USERS: 'users',
  QUESTION_PAPERS: 'questionPapers',
  QUIZZES: 'quizzes'
};

const SUBJECT_OPTIONS = [
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'history', label: 'History' },
  { value: 'english', label: 'English' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const [form] = Form.useForm();
  const [quizForm] = Form.useForm();

  const [users, setUsers] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState({
    users: true,
    questionPapers: true,
    quizzes: true
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(RESOURCE_TYPES.USERS);
  const [modalVisible, setModalVisible] = useState({
    question: false,
    quiz: false
  });

  const fetchData = useCallback(async (resourceType) => {
    try {
      setLoading(prev => ({ ...prev, [resourceType]: true }));
      
      const q = query(
        collection(db, resourceType), 
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString(),
      }));

      switch(resourceType) {
        case RESOURCE_TYPES.USERS:
          setUsers(data);
          break;
        case RESOURCE_TYPES.QUESTION_PAPERS:
          setQuestionPapers(data);
          break;
        case RESOURCE_TYPES.QUIZZES:
          setQuizzes(data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${resourceType}:`, err);
      message.error(`Failed to fetch ${resourceType}`);
      if (resourceType === RESOURCE_TYPES.USERS) {
        setError('Failed to fetch user data. Make sure you have admin access and correct Firestore rules.');
      }
    } finally {
      setLoading(prev => ({ ...prev, [resourceType]: false }));
    }
  }, []);

  useEffect(() => {
    if (currentUser && isAdmin) {
      fetchData(RESOURCE_TYPES.USERS);
      fetchData(RESOURCE_TYPES.QUESTION_PAPERS);
      fetchData(RESOURCE_TYPES.QUIZZES);
    }
  }, [currentUser, isAdmin, fetchData]);

  const handleSubmit = async (values, resourceType) => {
    try {
      const commonData = {
        title: values.title,
        subject: values.subject,
        link: values.link,
        type: resourceType === RESOURCE_TYPES.QUESTION_PAPERS ? 'questionPaper' : 'quiz',
        createdAt: new Date(),
        createdBy: currentUser.uid,
        description: values.description || null,
      };

      const data = resourceType === RESOURCE_TYPES.QUIZZES 
        ? { ...commonData, duration: values.duration }
        : commonData;

      await addDoc(collection(db, resourceType), data);
      message.success(`${resourceType === RESOURCE_TYPES.QUESTION_PAPERS ? 'Question paper' : 'Quiz'} added successfully!`);
      
      setModalVisible(prev => ({
        ...prev,
        [resourceType === RESOURCE_TYPES.QUESTION_PAPERS ? 'question' : 'quiz']: false
      }));
      
      form.resetFields();
      quizForm.resetFields();
      await fetchData(resourceType);
    } catch (err) {
      console.error(`Error adding ${resourceType}:`, err);
      message.error(`Failed to add ${resourceType === RESOURCE_TYPES.QUESTION_PAPERS ? 'question paper' : 'quiz'}`);
    }
  };

  const renderActions = (_, record) => (
    <Space size="middle">
      <Button 
        icon={<LinkOutlined />} 
        onClick={() => window.open(record.link, '_blank')}
        title="Open link"
      />
      <Button icon={<EditOutlined />} title="Edit" />
      <Button icon={<DeleteOutlined />} danger title="Delete" />
    </Space>
  );

  const questionPaperColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a href={record.link} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: subject => <Tag color="blue">{subject}</Tag>,
      filters: SUBJECT_OPTIONS.map(sub => ({ text: sub.label, value: sub.value })),
      onFilter: (value, record) => record.subject === value,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: renderActions,
    },
  ];

  const quizColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a href={record.link} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: subject => <Tag color="green">{subject}</Tag>,
      filters: SUBJECT_OPTIONS.map(sub => ({ text: sub.label, value: sub.value })),
      onFilter: (value, record) => record.subject === value,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: duration => `${duration} minutes`,
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: renderActions,
    },
  ];

  const userColumns = [
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
  ];

  if (authLoading) {
    return (
      <div className="center-container">
        <Spin tip="Authenticating..." size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="center-container">
        <Alert
          message="Authentication Required"
          description="Please sign in to access the admin dashboard."
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          }
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="center-container">
        <Alert
          message="Access Denied"
          description="You must be an administrator to view this page."
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-container">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <Card
        title={
          <div className="dashboard-header">
            <Title level={3} className="dashboard-title">
              <Space>
                <UserOutlined />
                Admin Dashboard
              </Space>
            </Title>
            <Text type="secondary">Manage system resources and users</Text>
          </div>
        }
        bordered={false}
        className="dashboard-card"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="dashboard-tabs"
        >
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Users
              </span>
            }
            key={RESOURCE_TYPES.USERS}
          >
            <div className="resource-section">
              <div className="stats-header">
                <Text>Total Users:</Text>
                <Title level={2} className="stats-value">{users.length}</Title>
              </div>
              <Divider />
              <Table
                dataSource={users}
                columns={userColumns}
                rowKey="id"
                loading={loading.users}
                bordered
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: total => `Total ${total} users`,
                }}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Question Papers
              </span>
            }
            key={RESOURCE_TYPES.QUESTION_PAPERS}
          >
            <div className="resource-section">
              <div className="action-header">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setModalVisible({ ...modalVisible, question: true })}
                >
                  Add Question Paper
                </Button>
                <QuestionPaperUpload 
                  onSuccess={() => fetchData(RESOURCE_TYPES.QUESTION_PAPERS)}
                  style={{ marginLeft: 16 }}
                />
              </div>
              <Divider />
              <Table
                dataSource={questionPapers}
                columns={questionPaperColumns}
                rowKey="id"
                loading={loading.questionPapers}
                bordered
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: total => `Total ${total} question papers`,
                }}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <QuestionCircleOutlined />
                Quizzes
              </span>
            }
            key={RESOURCE_TYPES.QUIZZES}
          >
            <div className="resource-section">
              <div className="action-header">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setModalVisible({ ...modalVisible, quiz: true })}
                >
                  Add Quiz
                </Button>
              </div>
              <Divider />
              <Table
                dataSource={quizzes}
                columns={quizColumns}
                rowKey="id"
                loading={loading.quizzes}
                bordered
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: total => `Total ${total} quizzes`,
                }}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Question Paper Modal */}
      <Modal
        title="Add Question Paper"
        visible={modalVisible.question}
        onCancel={() => setModalVisible({ ...modalVisible, question: false })}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={values => handleSubmit(values, RESOURCE_TYPES.QUESTION_PAPERS)}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please select the subject!' }]}
          >
            <Select 
              placeholder="Select subject"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {SUBJECT_OPTIONS.map(subject => (
                <Option key={subject.value} value={subject.value}>
                  {subject.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="link"
            label="Document Link"
            rules={[
              { required: true, message: 'Please input the link!' },
              { type: 'url', message: 'Please enter a valid URL!' }
            ]}
          >
            <Input placeholder="https://example.com/document" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        title="Add Quiz"
        visible={modalVisible.quiz}
        onCancel={() => setModalVisible({ ...modalVisible, quiz: false })}
        footer={null}
        destroyOnClose
      >
        <Form
          form={quizForm}
          layout="vertical"
          onFinish={values => handleSubmit(values, RESOURCE_TYPES.QUIZZES)}
        >
          <Form.Item
            name="title"
            label="Quiz Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter quiz title" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please select the subject!' }]}
          >
            <Select 
              placeholder="Select subject"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {SUBJECT_OPTIONS.map(subject => (
                <Option key={subject.value} value={subject.value}>
                  {subject.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="link"
            label="Quiz Link"
            rules={[
              { required: true, message: 'Please input the link!' },
              { type: 'url', message: 'Please enter a valid URL!' }
            ]}
          >
            <Input placeholder="https://example.com/quiz" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please input the duration!' }]}
          >
            <Input type="number" min={1} placeholder="Enter duration in minutes" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}