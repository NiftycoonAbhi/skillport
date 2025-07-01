import React, { useState, useEffect } from 'react';
import { FiUpload, FiSave, FiPlus, FiX, FiAward, FiLink, FiTag, FiDownload } from 'react-icons/fi';
import { db } from '../firebase'; // Import your Firebase configuration
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

function UploadCertificate() {
  const [certificates, setCertificates] = useState([]);
  const [newCertificate, setNewCertificate] = useState({
    title: '',
    organization: '',
    link: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the certificates collection in Firestore
  const certificatesCollectionRef = collection(db, 'certificates');

  // Load certificates from Firestore on component mount
  useEffect(() => {
    const getCertificates = async () => {
      setIsLoading(true);
      try {
        const data = await getDocs(certificatesCollectionRef);
        const certificatesData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }));
        setCertificates(certificatesData);
        setMessage({ text: 'Certificates loaded successfully!', type: 'success' });
      } catch (error) {
        console.error('Error loading certificates:', error);
        setMessage({ 
          text: 'Failed to load certificates', 
          type: 'error' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    getCertificates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCertificate = async () => {
    if (!newCertificate.title) {
      setMessage({ text: 'Title is required', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Add certificate to Firestore
      const docRef = await addDoc(certificatesCollectionRef, newCertificate);
      
      // Update local state with the new certificate including its ID
      setCertificates(prev => [...prev, { ...newCertificate, id: docRef.id }]);
      
      setMessage({ 
        text: 'Certificate added successfully!', 
        type: 'success' 
      });
      
      // Reset form
      setNewCertificate({ 
        title: '', 
        organization: '', 
        link: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error adding certificate:', error);
      setMessage({ 
        text: 'Failed to add certificate', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCertificate = async (id) => {
    setIsLoading(true);
    try {
      // Delete certificate from Firestore
      await deleteDoc(doc(db, 'certificates', id));
      
      // Update local state
      const updatedCertificates = certificates.filter(cert => cert.id !== id);
      setCertificates(updatedCertificates);
      
      setMessage({ 
        text: 'Certificate removed successfully!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error removing certificate:', error);
      setMessage({ 
        text: 'Failed to remove certificate', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
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
            : message.type === 'error'
            ? 'bg-red-100 text-red-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Certificate Management */}
        <div className="space-y-6">
          {/* Add New Certificate Form */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Add New Certificate</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newCertificate.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleAddCertificate}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  <FiPlus className="mr-2" />
                  {isLoading ? 'Adding...' : 'Add Certificate'}
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
                {isLoading ? 'Loading certificates...' : 'No certificates available'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {certificates.map((cert) => (
                <div 
                  key={cert.id}
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
                      {cert.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Issued: {new Date(cert.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveCertificate(cert.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove certificate"
                      disabled={isLoading}
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