import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, Typography, Spin, Alert, Button, Table, Form, Input, Select, Divider, Modal, message, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const [form] = Form.useForm();
  const [quizForm] = Form.useForm();

  const [users, setUsers] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [questionPapersLoading, setQuestionPapersLoading] = useState(false);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'users'));
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data. Make sure you have admin access and correct Firestore rules.');
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestionPapers = async () => {
      try {
        setQuestionPapersLoading(true);
        const q = query(collection(db, 'questionPapers'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const papers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleString(),
        }));
        setQuestionPapers(papers);
      } catch (err) {
        console.error('Error fetching question papers:', err);
        message.error('Failed to fetch question papers');
      } finally {
        setQuestionPapersLoading(false);
      }
    };

    const fetchQuizzes = async () => {
      try {
        setQuizzesLoading(true);
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const quizzesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleString(),
        }));
        setQuizzes(quizzesData);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        message.error('Failed to fetch quizzes');
      } finally {
        setQuizzesLoading(false);
      }
    };

    if (currentUser && isAdmin) {
      fetchUserData();
      fetchQuestionPapers();
      fetchQuizzes();
    }
  }, [currentUser, isAdmin]);

  const handleQuestionSubmit = async (values) => {
    try {
      const data = {
        title: values.title,
        subject: values.subject,
        link: values.link,
        type: 'questionPaper',
        createdAt: new Date(),
        createdBy: currentUser.uid,
        description: values.description || null, // Ensure description is never undefined
      };

      await addDoc(collection(db, 'questionPapers'), data);
      message.success('Question paper added successfully!');
      setIsQuestionModalVisible(false);
      form.resetFields();
      
      // Refresh the question papers list
      const q = query(collection(db, 'questionPapers'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const papers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString(),
      }));
      setQuestionPapers(papers);
    } catch (err) {
      console.error('Error adding question paper:', err);
      message.error('Failed to add question paper');
    }
  };

  const handleQuizSubmit = async (values) => {
    try {
      const data = {
        title: values.title,
        subject: values.subject,
        link: values.link,
        duration: values.duration,
        type: 'quiz',
        createdAt: new Date(),
        createdBy: currentUser.uid,
        description: values.description || null, // Ensure description is never undefined
      };

      await addDoc(collection(db, 'quizzes'), data);
      message.success('Quiz added successfully!');
      setIsQuizModalVisible(false);
      quizForm.resetFields();
      
      // Refresh the quizzes list
      const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const quizzesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString(),
      }));
      setQuizzes(quizzesData);
    } catch (err) {
      console.error('Error adding quiz:', err);
      message.error('Failed to add quiz');
    }
  };

  const questionPaperColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a href={record.link} rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => <Tag color="blue">{subject}</Tag>,
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
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<LinkOutlined />} 
            onClick={() => window.location.href = record.link}
          />
          <Button icon={<EditOutlined />} />
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  const quizColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a href={record.link} rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => <Tag color="green">{subject}</Tag>,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} minutes`,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<LinkOutlined />} 
            onClick={() => window.location.href = record.link}
          />
          <Button icon={<EditOutlined />} />
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="Authenticating..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Alert
        message="Authentication Required"
        description="Please sign in to access this page."
        type="warning"
        showIcon
        action={
          <Button size="small" type="primary" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        }
        style={{ margin: '24px' }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Alert
          message="Access Denied"
          description="You must be an administrator to view this page."
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        <Button type="primary" onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  const userColumns = [
    {
      title: 'Full Name',
      key: 'name',
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={<Title level={2}>Admin Dashboard</Title>}
        tabList={[
          { key: 'users', tab: 'User Management' },
          { key: 'questions', tab: 'Question Papers' },
          { key: 'quizzes', tab: 'Quizzes' },
        ]}
        activeTabKey={activeTab}
        onTabChange={key => setActiveTab(key)}
        extra={[
          activeTab === 'questions' && (
            <Button key="add-question" type="primary" icon={<PlusOutlined />} onClick={() => setIsQuestionModalVisible(true)}>
              Add Question Paper
            </Button>
          ),
          activeTab === 'quizzes' && (
            <Button key="add-quiz" type="primary" icon={<PlusOutlined />} onClick={() => setIsQuizModalVisible(true)}>
              Add Quiz
            </Button>
          ),
        ]}
      >
        {loading && activeTab === 'users' ? (
          <Spin tip="Loading data...">
            <div style={{ height: 200 }} />
          </Spin>
        ) : (
          <>
            {activeTab === 'users' && (
              <>
                <div style={{ marginTop: 24, marginBottom: 24 }}>
                  <Text>Total Users in System:</Text>
                  <Title level={1} style={{ color: '#1890ff' }}>{users.length}</Title>
                </div>
                <Table
                  dataSource={users}
                  columns={userColumns}
                  rowKey="id"
                  bordered
                  pagination={{
                    pageSize: 5,
                    showTotal: (total) => `Total ${total} users`,
                  }}
                />
              </>
            )}

            {activeTab === 'questions' && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsQuestionModalVisible(true)}
                  >
                    Add New Question Paper
                  </Button>
                </div>
                <Table
                  dataSource={questionPapers}
                  columns={questionPaperColumns}
                  rowKey="id"
                  loading={questionPapersLoading}
                  bordered
                  pagination={{
                    pageSize: 5,
                    showTotal: (total) => `Total ${total} question papers`,
                  }}
                />
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsQuizModalVisible(true)}
                  >
                    Add New Quiz
                  </Button>
                </div>
                <Table
                  dataSource={quizzes}
                  columns={quizColumns}
                  rowKey="id"
                  loading={quizzesLoading}
                  bordered
                  pagination={{
                    pageSize: 5,
                    showTotal: (total) => `Total ${total} quizzes`,
                  }}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add Question Paper Modal */}
      <Modal
        title="Add Question Paper"
        open={isQuestionModalVisible}
        onCancel={() => setIsQuestionModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleQuestionSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter question paper title" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please select the subject!' }]}
          >
            <Select placeholder="Select subject">
              <Option value="math">Mathematics</Option>
              <Option value="science">Science</Option>
              <Option value="history">History</Option>
              <Option value="english">English</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="link"
            label="Question Paper Link"
            rules={[
              { required: true, message: 'Please input the link!' },
              { type: 'url', message: 'Please enter a valid URL!' }
            ]}
          >
            <Input placeholder="https://example.com/question-paper.pdf" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Quiz Modal */}
      <Modal
        title="Add Quiz"
        open={isQuizModalVisible}
        onCancel={() => setIsQuizModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={quizForm}
          layout="vertical"
          onFinish={handleQuizSubmit}
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
            <Select placeholder="Select subject">
              <Option value="math">Mathematics</Option>
              <Option value="science">Science</Option>
              <Option value="history">History</Option>
              <Option value="english">English</Option>
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
            <Input type="number" placeholder="Enter duration in minutes" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}