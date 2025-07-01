import React, { useState, useEffect } from 'react';
import { FiUpload, FiSave, FiPlus, FiX, FiAward, FiLink, FiTag, FiDownload } from 'react-icons/fi';
import certificatesData from '../data/certificates.json'; // Import the JSON file

function UploadCertificate() {
  const [certificates, setCertificates] = useState([]);
  const [newCertificate, setNewCertificate] = useState({
    title: '',
    organization: '',
    link: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  // Load certificates from imported JSON file on first render
  useEffect(() => {
    try {
      if (certificatesData && certificatesData.certificates) {
        setCertificates(certificatesData.certificates);
        setMessage({ text: 'Sample certificates loaded!', type: 'success' });
      } else {
        throw new Error('Invalid certificates data structure');
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      setMessage({ 
        text: 'Failed to load sample certificates', 
        type: 'error' 
      });
    }
  }, []);

  // ... rest of your component code remains the same ...

  const handleFileOpen = async (e) => {
    setIsFileLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const file = e.target.files[0];
      if (!file) return;

      setFileName(file.name);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          
          if (!jsonData.certificates) {
            throw new Error('Invalid JSON structure. Expected "certificates" array.');
          }

          setCertificates(jsonData.certificates);
          setMessage({ text: 'File loaded successfully!', type: 'success' });
        } catch (error) {
          console.error('Error parsing file:', error);
          setMessage({ 
            text: 'Failed to parse file. Please ensure it is a valid certificates.json file.',
            type: 'error' 
          });
        } finally {
          setIsFileLoading(false);
        }
      };

      reader.onerror = () => {
        setMessage({ 
          text: 'Error reading file', 
          type: 'error' 
        });
        setIsFileLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error opening file:', error);
      setMessage({ 
        text: error.message,
        type: 'error' 
      });
      setIsFileLoading(false);
    }
  };

  const handleFileSave = () => {
    setIsFileLoading(true);
    try {
      const dataStr = JSON.stringify({ certificates }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', fileName || 'certificates.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ text: 'File download started!', type: 'success' });
    } catch (error) {
      console.error('Error saving file:', error);
      setMessage({ 
        text: `Failed to save file: ${error.message}`,
        type: 'error' 
      });
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCertificate = () => {
    if (!newCertificate.title) {
      setMessage({ text: 'Title is required', type: 'error' });
      return;
    }

    setCertificates(prev => [...prev, newCertificate]);
    setNewCertificate({ title: '', organization: '', link: '' });
    setMessage({ text: 'Certificate added to list', type: 'success' });
    setIsEditing(false);
  };

  const handleRemoveCertificate = (index) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
    setMessage({ text: 'Certificate removed', type: 'success' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center mb-6">
        <FiAward className="text-2xl text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Manage Certificates</h2>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Operations */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">File Operations</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="sr-only">Choose certificate file</span>
                <input
                  type="file"
                  onChange={handleFileOpen}
                  accept=".json"
                  className="hidden"
                  id="fileInput"
                />
                <button
                  onClick={() => document.getElementById('fileInput').click()}
                  disabled={isFileLoading}
                  className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg ${
                    isFileLoading
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  {isFileLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      Open certificates.json
                    </>
                  )}
                </button>
              </label>

              <button
                onClick={handleFileSave}
                disabled={certificates.length === 0 || isFileLoading}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium ${
                  certificates.length === 0 || isFileLoading
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {isFileLoading ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <FiDownload className="mr-2" />
                    Download Certificates
                  </>
                )}
              </button>
            </div>
            {fileName && (
              <p className="mt-2 text-sm text-gray-500 truncate">
                Current file: {fileName}
              </p>
            )}
          </div>

          {/* Add New Certificate Form */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Add New Certificate</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              >
                {isEditing ? <FiX /> : <FiPlus />}
              </button>
            </div>

            {isEditing && (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiAward className="mr-2" /> Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newCertificate.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Certificate title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiTag className="mr-2" /> Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={newCertificate.organization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Issuing organization"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiLink className="mr-2" /> Verification URL
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={newCertificate.link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/verify"
                  />
                </div>

                <button
                  onClick={handleAddCertificate}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Add Certificate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Certificates List */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Current Certificates ({certificates.length})
          </h3>
          
          {certificates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {isFileLoading ? 'Loading certificates...' : 'No certificates loaded'}
              </p>
              <p className="text-sm text-gray-400">
                Load a file or add certificates manually
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {certificates.map((cert, index) => (
                <div 
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-white transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                        {cert.title}
                      </h4>
                      {cert.organization && (
                        <p className="text-sm text-gray-600 mt-1">
                          {cert.organization}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveCertificate(index)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove certificate"
                    >
                      <FiX />
                    </button>
                  </div>
                  {cert.link && (
                    <a 
                      href={cert.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2 transition-colors"
                    >
                      <FiLink className="mr-1" /> Verify URL
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadCertificate;