import React, { useState } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiCode, FiLink, FiGithub, FiYoutube, FiFileText, FiUpload, FiSave } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

function AddProject() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    liveLink: '',
    githubLink: '',
    videoLink: '',
    notes: ''
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles([...e.target.files]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.techStack) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ text: '', type: '' });
      const user = auth.currentUser;

      // Upload files if any
      let fileURLs = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const storageRef = ref(storage, `projects/${user.uid}/${uuidv4()}`);
          const snapshot = await uploadBytes(storageRef, file);
          return await getDownloadURL(snapshot.ref);
        });
        fileURLs = await Promise.all(uploadPromises);
      }

      await addDoc(collection(db, 'projects'), {
        uid: user.uid,
        ...formData,
        fileURLs,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      setMessage({ text: 'Project added successfully!', type: 'success' });
      setFormData({
        title: '',
        description: '',
        techStack: '',
        liveLink: '',
        githubLink: '',
        videoLink: '',
        notes: ''
      });
      setFiles([]);
    } catch (err) {
      console.error('Error adding project:', err);
      setMessage({ text: `Error adding project: ${err.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center mb-6">
        <FiCode className="text-2xl text-green-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Add New Project</h2>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="My Awesome Project"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tech Stack *
              </label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="React, Node.js, MongoDB"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate technologies with commas
              </p>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiLink className="mr-2" /> Live URL
              </label>
              <input
                type="url"
                name="liveLink"
                value={formData.liveLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://myproject.com"
              />
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiYoutube className="mr-2" /> Demo Video
              </label>
              <input
                type="url"
                name="videoLink"
                value={formData.videoLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiGithub className="mr-2" /> GitHub Repository
              </label>
              <input
                type="url"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows="4"
            placeholder="Describe your project, its features, and what problems it solves..."
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FiFileText className="mr-2" /> Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows="3"
            placeholder="Any challenges faced, lessons learned, or future improvements..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center px-6 py-3 rounded-lg text-white font-medium ${
              isSubmitting 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 transition-colors'
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
                <FiSave className="mr-2" /> Save Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProject;