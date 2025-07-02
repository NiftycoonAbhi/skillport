import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiUpload, FiCalendar, FiAward, FiLink, FiTag, FiSave, FiExternalLink, FiSearch, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
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
  const [uploadProgress, setUploadProgress] = useState(0); // Not fully utilized in this snippet, but good to keep
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [availableCertificates, setAvailableCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setAvailableCertificates(certificatesData.certificates);
    setFilteredCertificates(certificatesData.certificates);
  }, []);

  useEffect(() => {
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
      driveURL: cert.link || '',
      description: cert.description || '', // Pre-fill description if available
      category: cert.category || '' // Pre-fill category if available
    }));
    setMessage({ text: `Selected "${cert.title}". Review and save.`, type: 'info' });
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
      if (!user) throw new Error('User not authenticated. Please log in.');

      let fileURL = '';
      if (file) {
        const storageRef = ref(storage, `certificates/${user.uid}/${uuidv4()}_${file.name}`); // Added file.name
        // You can add upload progress listeners here if needed, e.g., on('state_changed', ...)
        const snapshot = await uploadBytes(storageRef, file);
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
      setSearchTerm(''); // Clear search term on successful submission
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
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex items-center justify-between">
            <div className="flex items-center">
              <FiAward className="text-4xl text-white mr-4" />
              <h2 className="text-3xl font-extrabold text-white">Add New Certificate</h2>
            </div>
            {/* You could add more actions here if needed */}
          </div>

          {/* Message Area */}
          {message.text && (
            <div className={`p-4 mx-6 mt-6 rounded-lg flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : message.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {message.type === 'success' && <FiCheckCircle className="mr-3 text-green-500 text-xl" />}
              {message.type === 'error' && <FiXCircle className="mr-3 text-red-500 text-xl" />}
              {message.type === 'info' && <FiInfo className="mr-3 text-blue-500 text-xl" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Available Certificates Section */}
            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl shadow-inner">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <FiAward className="mr-3 text-blue-600" /> Pre-filled Certificates
              </h3>

              {/* Search Bar */}
              <div className="relative mb-5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                  placeholder="Search by title or organization..."
                />
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar for better aesthetics */}
                {filteredCertificates.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <p>{searchTerm.trim() === ''
                      ? 'No certificates available to pre-fill.'
                      : 'No certificates match your search criteria.'}</p>
                    <p className="mt-2 text-sm">Try adding a new one manually!</p>
                  </div>
                ) : (
                  filteredCertificates.map((cert, index) => (
                    <div
                      key={index}
                      onClick={() => handleCertificateSelect(cert)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] ${
                        selectedCertificate?.title === cert.title
                          ? 'border-blue-600 bg-blue-100 shadow-md ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900 text-base">{cert.title}</h4>
                        {cert.link && (
                          <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors ml-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            title="View Credential"
                          >
                            <FiExternalLink size={16} />
                          </a>
                        )}
                      </div>
                      {cert.organization && (
                        <p className="text-sm text-gray-600 mt-1">{cert.organization}</p>
                      )}
                      {cert.description && (
                         <p className="text-xs text-gray-500 mt-2 line-clamp-2">{cert.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certificate Form Section */}
            <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiSave className="mr-3 text-blue-600" /> Certificate Details
              </h3>
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="form-group">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiAward className="mr-2 text-gray-500" /> Certificate Title <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        placeholder="e.g. AWS Certified Solutions Architect"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiTag className="mr-2 text-gray-500" /> Organization <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        placeholder="e.g. Amazon Web Services"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiCalendar className="mr-2 text-gray-500" /> Issue Date <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="form-group">
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiTag className="mr-2 text-gray-500" /> Category <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all bg-white"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Project Management">Project Management</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Database Management">Database Management</option>
                        <option value="Networking">Networking</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="driveURL" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiLink className="mr-2 text-gray-500" /> Credential URL (Optional)
                      </label>
                      <input
                        type="url"
                        id="driveURL"
                        name="driveURL"
                        value={formData.driveURL}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        placeholder="https://example.com/verify-certificate"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="credentialID" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiTag className="mr-2 text-gray-500" /> Credential ID (Optional)
                      </label>
                      <input
                        type="text"
                        id="credentialID"
                        name="credentialID"
                        value={formData.credentialID}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        placeholder="e.g. AWS-123456"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    rows="4"
                    placeholder="Brief description of the certificate, skills acquired, and relevance..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="certificateFile" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiUpload className="mr-2 text-gray-500" /> Certificate File (PDF, PNG, JPG - Optional)
                  </label>
                  <input
                    type="file"
                    id="certificateFile"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  {file && <p className="mt-2 text-sm text-gray-500">Selected file: <span className="font-medium text-gray-700">{file.name}</span></p>}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center px-8 py-3 rounded-full text-white font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95
                      ${isSubmitting
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
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
                        <FiSave className="mr-2 text-lg" /> Save Certificate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Custom Scrollbar Style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* gray-300 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0; /* gray-400 */
        }
      `}</style>
    </div>
  );
}

export default AddCertificate;