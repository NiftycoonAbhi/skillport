import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, message, DatePicker, Table, Popconfirm, Space, Modal, Collapse, Upload, Card } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import jobsData from '../data/jobsByStandard.json';

const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

const AdminJobsManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  // Load initial data from JSON file
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    try {
      setLoading(true);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      message.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const saveJobsToFile = async (updatedJobs) => {
    // In a real app, you would need a backend API to write to JSON files
    console.log('Jobs data would be saved here:', updatedJobs);
    message.success('Jobs data updated (simulated save to JSON file)');
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const newJob = {
        ...values,
        lastDate: values.lastDate.format('YYYY-MM-DD'),
        createdAt: new Date().toISOString()
      };

      // Create a deep copy of the current data
      const updatedJobsData = JSON.parse(JSON.stringify(jobs));

      // Initialize if not exists
      if (!updatedJobsData[values.standard]) {
        updatedJobsData[values.standard] = {};
      }
      if (!updatedJobsData[values.standard][values.type]) {
        updatedJobsData[values.standard][values.type] = [];
      }

      if (currentJob) {
        // Update existing job
        const jobIndex = updatedJobsData[currentJob.standard][currentJob.type]
          .findIndex(j => j.title === currentJob.title);
        if (jobIndex !== -1) {
          updatedJobsData[currentJob.standard][currentJob.type][jobIndex] = {
            ...newJob,
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        // Add new job
        updatedJobsData[values.standard][values.type].push(newJob);
      }

      await saveJobsToFile(updatedJobsData);
      setJobs(updatedJobsData);
      
      form.resetFields();
      setIsModalOpen(false);
      setCurrentJob(null);
    } catch (error) {
      console.error('Error saving job:', error);
      message.error('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job, standard, type) => {
    setCurrentJob({ ...job, standard, type });
    form.setFieldsValue({
      ...job,
      standard,
      type,
      lastDate: job.lastDate ? moment(job.lastDate, 'YYYY-MM-DD') : null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (job, standard, type) => {
    try {
      setLoading(true);
      // Create a deep copy of the current data
      const updatedJobsData = JSON.parse(JSON.stringify(jobs));
      
      // Remove the job from the JSON structure
      updatedJobsData[standard][type] = updatedJobsData[standard][type]
        .filter(j => j.title !== job.title);
      
      await saveJobsToFile(updatedJobsData);
      setJobs(updatedJobsData);
      
      message.success('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      message.error('Failed to delete job');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel';
    if (!isExcel) {
      message.error('You can only upload Excel files!');
    }
    return isExcel;
  };

  const handleBulkUpload = (info) => {
    const { file } = info;
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Process the Excel data
        const processedData = processExcelData(jsonData);
        
        // Merge with existing data
        const updatedJobsData = JSON.parse(JSON.stringify(jobs));
        for (const standard in processedData) {
          if (!updatedJobsData[standard]) {
            updatedJobsData[standard] = {};
          }
          for (const type in processedData[standard]) {
            if (!updatedJobsData[standard][type]) {
              updatedJobsData[standard][type] = [];
            }
            updatedJobsData[standard][type] = [
              ...updatedJobsData[standard][type],
              ...processedData[standard][type]
            ];
          }
        }
        
        setJobs(updatedJobsData);
        saveJobsToFile(updatedJobsData);
        setIsBulkUploadModalOpen(false);
        message.success(`${jsonData.length} jobs uploaded successfully!`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        message.error('Failed to process Excel file');
      }
    };
    
    reader.readAsArrayBuffer(file);
    return false; // Prevent automatic upload
  };

  const processExcelData = (excelData) => {
    const result = {};
    
    excelData.forEach(row => {
      const standard = row['Standard'] || 'Other';
      const type = row['Type'] === 'Private' ? 'Private Jobs' : 'Government Jobs';
      
      if (!result[standard]) {
        result[standard] = {};
      }
      if (!result[standard][type]) {
        result[standard][type] = [];
      }
      
      result[standard][type].push({
        title: row['Title'],
        description: row['Description'] || '',
        link: row['Link'] || '#',
        lastDate: row['Last Date'] || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
    });
    
    return result;
  };

  const renderJobCards = (jobs, standard, type) => {
    return jobs.map((job, index) => (
      <Card 
        key={`${standard}-${type}-${index}`}
        title={job.title}
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(job, standard, type)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to delete this job?"
              onConfirm={() => handleDelete(job, standard, type)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          </Space>
        }
      >
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Link:</strong> <a href={job.link} target="_blank" rel="noopener noreferrer">{job.link}</a></p>
        <p><strong>Last Date:</strong> {job.lastDate}</p>
      </Card>
    ));
  };

  const renderJobsByStandard = () => {
    return Object.keys(jobs).map(standard => (
      <Collapse key={standard} style={{ marginBottom: 16 }}>
        <Panel header={`${standard} Standard Jobs`} key={standard}>
          {Object.keys(jobs[standard]).map(type => (
            <div key={`${standard}-${type}`}>
              <h3 style={{ margin: '16px 0' }}>{type}</h3>
              {renderJobCards(jobs[standard][type], standard, type)}
            </div>
          ))}
        </Panel>
      </Collapse>
    ));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Job Opportunities Management</h2>
        <Space>
          <Button 
            type="primary" 
            onClick={() => setIsBulkUploadModalOpen(true)}
          >
            Bulk Upload Jobs
          </Button>
          <Button 
            type="primary" 
            onClick={() => {
              setIsModalOpen(true);
              setCurrentJob(null);
              form.resetFields();
            }}
          >
            Add New Job
          </Button>
        </Space>
      </div>

      {renderJobsByStandard()}

      <Modal
        title={currentJob ? "Edit Job" : "Add New Job"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setCurrentJob(null);
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="title"
            label="Job Title"
            rules={[{ required: true, message: 'Please input job title!' }]}
          >
            <Input placeholder="Enter job title" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Job Type"
            rules={[{ required: true, message: 'Please select job type!' }]}
          >
            <Select placeholder="Select job type">
              <Option value="Government Jobs">Government Job</Option>
              <Option value="Private Jobs">Private Job</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="standard"
            label="Target Standard"
            rules={[{ required: true, message: 'Please select standard!' }]}
          >
            <Select placeholder="Select standard">
              <Option value="10th">10th</Option>
              <Option value="11th">11th</Option>
              <Option value="12th">12th</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Diploma">Diploma</Option>
              <Option value="Graduation">Graduation</Option>
              <Option value="Post Graduation">Post Graduation</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Job Description"
            rules={[{ required: true, message: 'Please input job description!' }]}
          >
            <TextArea rows={4} placeholder="Enter job description" />
          </Form.Item>

          <Form.Item
            name="link"
            label="Application Link"
            rules={[{ required: true, message: 'Please input application link!' }]}
          >
            <Input placeholder="Enter application URL" />
          </Form.Item>

          <Form.Item
            name="lastDate"
            label="Last Date to Apply"
            rules={[{ required: true, message: 'Please select last date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {currentJob ? 'Update Job' : 'Add Job'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Bulk Upload Jobs"
        open={isBulkUploadModalOpen}
        onCancel={() => setIsBulkUploadModalOpen(false)}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Download the template file to ensure proper formatting:</p>
          <Button 
            type="primary" 
            onClick={() => {
              // Create template Excel file
              const templateData = [
                {
                  'Standard': '10th',
                  'Type': 'Government',
                  'Title': 'SSC 10th Pass Jobs',
                  'Description': 'Various government jobs available for 10th pass candidates',
                  'Link': 'https://ssc.nic.in/',
                  'Last Date': '2023-12-31'
                }
              ];
              
              const ws = XLSX.utils.json_to_sheet(templateData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Jobs Template");
              XLSX.writeFile(wb, "jobs_template.xlsx");
            }}
          >
            Download Template
          </Button>
        </div>
        
        <Upload
          name="file"
          accept=".xlsx, .xls"
          beforeUpload={beforeUpload}
          customRequest={handleBulkUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Click to Upload Excel File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default AdminJobsManagement;