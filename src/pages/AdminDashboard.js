// src/pages/AdminDashboard.js
import React, { useCallback, useState } from "react";
import {
  Layout,
  Typography,
  Spin,
  Alert,
  Button,
  message,
  Divider,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";

import Sidebar from "../components/Sidebar";
import UserOverview from "./UserOverview";
import QuestionPaperUpload from "./QuestionPaperUpload";
import EditSubjects from "./EditSubjects";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const RESOURCE_TYPES = {
  USERS: "users",
  QUESTION_PAPERS: "questionPapers",
  SUBJECTS: "subjects",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState(RESOURCE_TYPES.USERS);
  const [loading, setLoading] = useState({ users: true, questionPapers: true });
  const [error, setError] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const fetchData = useCallback(
    async (resourceType) => {
      try {
        setLoading((prev) => ({ ...prev, [resourceType]: true }));
        let q;
        if (
          resourceType === RESOURCE_TYPES.QUESTION_PAPERS &&
          selectedStandard
        ) {
          q = query(
            collection(db, resourceType),
            where("standard", "==", selectedStandard),
            orderBy("createdAt", "desc")
          );
        } else {
          q = query(collection(db, resourceType), orderBy("createdAt", "desc"));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleString(),
        }));

        return data;
      } catch (err) {
        console.error(`Error fetching ${resourceType}:`, err);
        message.error(`Failed to fetch ${resourceType}`);
        if (resourceType === RESOURCE_TYPES.USERS) {
          setError(
            "Failed to fetch user data. Check admin access and Firestore rules."
          );
        }
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, [resourceType]: false }));
      }
    },
    [selectedStandard]
  );

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin tip="Authenticating..." size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert
          message="Authentication Required"
          description="Please sign in to access the admin dashboard."
          type="warning"
          showIcon
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          }
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert
          message="Access Denied"
          description="You must be an administrator to view this page."
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate("/")}>
              Return to Home
            </Button>
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
      />

      <Layout style={{ padding: "0 24px 24px" }}>
        <Header style={{ background: "#fff", padding: 16 }}>
          <Title level={3} className="m-0">
            Admin Dashboard
          </Title>
          <Text type="secondary">
            Manage users, subjects, and question papers
          </Text>
        </Header>
        <Content style={{ margin: "24px 0", overflowY: "auto" }}>
          {activeTab === RESOURCE_TYPES.USERS && (
            <UserOverview fetchData={fetchData} loading={loading.users} />
          )}
          {activeTab === RESOURCE_TYPES.SUBJECTS && <EditSubjects />}
          {activeTab === RESOURCE_TYPES.QUESTION_PAPERS && (
            <>
              <div className="mb-4">
                <QuestionPaperUpload
                  onSuccess={() => fetchData(RESOURCE_TYPES.QUESTION_PAPERS)}
                  standard={selectedStandard}
                  subject={selectedSubject}
                />
              </div>
              <Divider />
              {/* Add your paper list/table here */}
              <Text type="secondary">No question papers to display yet.</Text>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
