import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FiEdit2, FiTrash2, FiSave, FiX, FiAward, FiExternalLink, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

function CertificateList() {
  const [certificates, setCertificates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ 
    title: '', 
    organization: '', 
    category: '',
    date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    const q = query(collection(db, 'certificates'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const certs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        formattedDate: doc.data().date ? format(new Date(doc.data().date), 'MMM d, yyyy') : 'No date'
      }));
      setCertificates(certs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await deleteDoc(doc(db, 'certificates', id));
      } catch (error) {
        console.error('Error deleting certificate:', error);
      }
    }
  };

  const startEdit = (cert) => {
    setEditingId(cert.id);
    setEditData({ 
      title: cert.title, 
      organization: cert.organization, 
      category: cert.category,
      date: cert.date || ''
    });
  };

  const handleEditSave = async () => {
    try {
      const certRef = doc(db, 'certificates', editingId);
      await updateDoc(certRef, {
        ...editData,
        lastUpdated: new Date()
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating certificate:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <FiAward className="text-2xl text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Your Certificates</h2>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">You haven't added any certificates yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              {editingId === cert.id ? (
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editData.organization}
                        onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      onClick={cancelEdit}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                    <button 
                      onClick={handleEditSave}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FiSave className="mr-2" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{cert.title}</h3>
                        <p className="text-sm text-gray-600 flex items-center mb-2">
                          <FiAward className="mr-2 text-blue-500" /> {cert.organization}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mb-2">
                          <FiCalendar className="mr-2 text-blue-500" /> {cert.formattedDate}
                        </p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {cert.category}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => startEdit(cert)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                  {cert.driveURL && (
                    <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                      <a
                        href={cert.driveURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FiExternalLink className="mr-2" /> View Certificate
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CertificateList;