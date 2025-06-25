import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { FiUpload, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const subjectsByStandard = {
  '10th': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
  '11th': {
    'Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
    'Commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'Informatics Practices'],
    'Arts': ['History', 'Political Science', 'Geography', 'Economics', 'Psychology'],
  },
  '12th': {
    'Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
    'Commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'Informatics Practices'],
    'Arts': ['History', 'Political Science', 'Geography', 'Economics', 'Psychology'],
  },
  'Engineering': {
    'CSE': ['Data Structures', 'Algorithms', 'Computer Networks', 'DBMS', 'Operating Systems'],
    'ECE': ['Digital Electronics', 'Signals & Systems', 'VLSI Design', 'Communication Systems'],
    'EEE': ['Circuit Theory', 'Power Systems', 'Control Systems', 'Electrical Machines'],
    'ME': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design'],
    'CE': ['Structural Analysis', 'Geotechnical Engineering', 'Transportation Engineering'],
  }
};

function UploadQuestionPaper() {
  const [standard, setStandard] = useState('');
  const [stream, setStream] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [pdfLink, setPdfLink] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const getSubjects = () => {
    if (standard === '10th') return subjectsByStandard['10th'];
    return subjectsByStandard[standard]?.[stream] || [];
  };

  const handleUpload = async () => {
    if (!title || !pdfLink || !subject) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const paperData = {
        title,
        fileURL: pdfLink,
        subject,
        standard,
        type: 'questionPaper',
        approved: true,
        year,
        createdAt: Timestamp.now(),
        createdBy: 'admin-manual',
      };

      if (standard !== '10th') {
        paperData.branch = stream;
      }

      await addDoc(collection(db, 'questionPapers'), paperData);

      setSuccess('Question paper uploaded successfully!');
      setTitle('');
      setPdfLink('');
      setUploading(false);
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleBack = () => {
    if (subject) setSubject('');
    else if (stream) setStream('');
    else if (standard) setStandard('');
    setError('');
  };

  const renderStandardSelection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Select Standard</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.keys(subjectsByStandard).map((std) => (
          <button
            key={std}
            onClick={() => setStandard(std)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center border border-gray-100 hover:border-blue-200"
          >
            <h3 className="text-lg font-semibold text-gray-700">{std}</h3>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStreamSelection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Select Stream - {standard}</h2>
        <button 
          onClick={handleBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FiArrowLeft /> Back
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.keys(subjectsByStandard[standard]).map((str) => (
          <button
            key={str}
            onClick={() => setStream(str)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center border border-gray-100 hover:border-blue-200"
          >
            <h3 className="text-lg font-semibold text-gray-700">{str}</h3>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSubjectSelection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Select Subject - {standard}
          {stream && ` (${stream})`}
        </h2>
        <button 
          onClick={handleBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FiArrowLeft /> Back
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {getSubjects().map((sub) => (
          <button
            key={sub}
            onClick={() => setSubject(sub)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center border border-gray-100 hover:border-blue-200 capitalize"
          >
            <h3 className="text-lg font-semibold text-gray-700">{sub}</h3>
          </button>
        ))}
      </div>
    </div>
  );

  const renderUploadForm = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Upload Question Paper - {subject} ({standard}
          {stream && `, ${stream}`})
        </h2>
        <button 
          onClick={handleBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paper Title*</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Final Exam 2023"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PDF Link*</label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={pdfLink}
              onChange={(e) => setPdfLink(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            <p className="mt-1 text-xs text-gray-500">Please provide a direct download link</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              uploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <FiUpload /> Upload Question Paper
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md flex items-center gap-2">
          <FiCheckCircle className="text-lg" />
          {success}
        </div>
      )}

      {!standard 
        ? renderStandardSelection()
        : !subject
          ? standard === '10th'
            ? renderSubjectSelection()
            : !stream
              ? renderStreamSelection()
              : renderSubjectSelection()
          : renderUploadForm()
      }
    </div>
  );
}

export default UploadQuestionPaper;