import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiUpload, FiCalendar, FiAward, FiLink, FiTag, FiSave, FiExternalLink, FiSearch } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

// Import or define your certificates data
import certificatesData from '../data/certificates.json';

function AddCertificate() {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    date: '',
    category: '',
    driveURL: '',
    description: '',
    credentialID: ''
  });
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [availableCertificates, setAvailableCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load available certificates from JSON file
    setAvailableCertificates(certificatesData.certificates);
    setFilteredCertificates(certificatesData.certificates);
  }, []);

  useEffect(() => {
    // Filter certificates based on search term
    if (searchTerm.trim() === '') {
      setFilteredCertificates(availableCertificates);
    } else {
      const filtered = availableCertificates.filter(cert =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.organization && cert.organization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCertificates(filtered);
    }
  }, [searchTerm, availableCertificates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCertificateSelect = (cert) => {
    setSelectedCertificate(cert);
    setFormData(prev => ({
      ...prev,
      title: cert.title,
      organization: cert.organization || '',
      driveURL: cert.link || ''
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      let fileURL = '';
      if (file) {
        const storageRef = ref(storage, `certificates/${user.uid}/${uuidv4()}`);
        const uploadTask = uploadBytes(storageRef, file);
        
        const snapshot = await uploadTask;
        fileURL = await getDownloadURL(snapshot.ref);
      }

      const certificateData = {
        uid: user.uid,
        ...formData,
        fileURL,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      await addDoc(collection(db, 'certificates'), certificateData);

      setMessage({ text: 'Certificate saved successfully!', type: 'success' });
      setFormData({
        title: '',
        organization: '',
        date: '',
        category: '',
        driveURL: '',
        description: '',
        credentialID: ''
      });
      setFile(null);
      setSelectedCertificate(null);
    } catch (error) {
      console.error('Error saving certificate:', error);
      setMessage({ 
        text: `Failed to save certificate: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center mb-6">
        <FiAward className="text-2xl text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Add New Certificate</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Certificates Section */}
        <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <FiAward className="mr-2" /> Available Certificates
            </h3>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search certificates..."
            />
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredCertificates.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchTerm.trim() === '' 
                  ? 'No certificates available' 
                  : 'No certificates match your search'}
              </div>
            ) : (
              filteredCertificates.map((cert, index) => (
                <div 
                  key={index}
                  onClick={() => handleCertificateSelect(cert)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCertificate?.title === cert.title 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-800">{cert.title}</h4>
                    {cert.link && (
                      <a 
                        href={cert.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  {cert.organization && (
                    <p className="text-sm text-gray-600 mt-1">{cert.organization}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certificate Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiAward className="mr-2" /> Certificate Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. AWS Certified Solutions Architect"
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
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Amazon Web Services"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiCalendar className="mr-2" /> Issue Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiTag className="mr-2" /> Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiLink className="mr-2" /> Credential URL
                  </label>
                  <input
                    type="url"
                    name="driveURL"
                    value={formData.driveURL}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/verify-certificate"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiTag className="mr-2" /> Credential ID
                  </label>
                  <input
                    type="text"
                    name="credentialID"
                    value={formData.credentialID}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. AWS-123456"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Brief description of the certificate and skills acquired..."
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiUpload className="mr-2" /> Certificate File (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center px-6 py-3 rounded-lg text-white font-medium ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Save Certificate
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCertificate;