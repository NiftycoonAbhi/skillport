import React, { useState } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiCode, FiLink, FiGithub, FiYoutube, FiFileText, FiUpload, FiSave, FiXCircle, FiCheckCircle } from 'react-icons/fi'; // Added FiXCircle, FiCheckCircle
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
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      // Allow multiple files and append them
      setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (fileNameToRemove) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.techStack) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ text: '', type: '' }); // Clear previous messages

      const user = auth.currentUser;
      if (!user) {
        setMessage({ text: 'You must be logged in to add a project.', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      let fileURLs = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const storageRef = ref(storage, `projects/${user.uid}/${uuidv4()}_${file.name}`); // Add original file name
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
      // Reset form
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center justify-center mb-8">
          <FiCode className="text-5xl text-green-600 mb-4 animate-bounce-slow" /> {/* Larger icon, subtle animation */}
          <h2 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight">
            Add New Project
          </h2>
          <p className="mt-2 text-lg text-gray-600 text-center">
            Showcase your amazing work to the world!
          </p>
        </div>

        {message.text && (
          <div className={`flex items-center p-4 rounded-lg shadow-md ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? <FiCheckCircle className="mr-3 text-green-500 text-xl" /> : <FiXCircle className="mr-3 text-red-500 text-xl" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8"> {/* Increased vertical spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Increased gap */}
            {/* Left Column */}
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out placeholder-gray-400"
                  placeholder="e.g., My Awesome E-commerce App"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="techStack" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tech Stack <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="techStack"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out placeholder-gray-400"
                  placeholder="e.g., React, Node.js, MongoDB, Tailwind CSS"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Separate technologies with commas (e.g., React, Firebase, CSS)
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="liveLink" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FiLink className="mr-2 text-green-500" /> Live URL
                </label>
                <input
                  type="url"
                  id="liveLink"
                  name="liveLink"
                  value={formData.liveLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out placeholder-gray-400"
                  placeholder="https://myproject.com"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="videoLink" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FiYoutube className="mr-2 text-red-500" /> Demo Video URL
                </label>
                <input
                  type="url"
                  id="videoLink"
                  name="videoLink"
                  value={formData.videoLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out placeholder-gray-400"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Link to a YouTube or Vimeo demo of your project.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="githubLink" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FiGithub className="mr-2 text-gray-700" /> GitHub Repository URL
                </label>
                <input
                  type="url"
                  id="githubLink"
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out placeholder-gray-400"
                  placeholder="https://github.com/username/project"
                />
              </div>

              {/* File Upload Section */}
              {/* <div className="form-group">
                <label htmlFor="fileUpload" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FiUpload className="mr-2 text-blue-500" /> Project Files / Screenshots
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileChange}
                  multiple
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer"
                />
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-600">Selected Files:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.name)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label={`Remove ${file.name}`}
                          >
                            <FiXCircle className="text-lg" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Upload screenshots, diagrams, or other relevant project files.
                </p>
              </div> */}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Project Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out placeholder-gray-400"
              rows="6" // Increased rows for more space
              placeholder="Describe your project, its key features, the problem it solves, and your role in its development."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiFileText className="mr-2 text-purple-500" /> Additional Notes / Learnings
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-200 ease-in-out placeholder-gray-400"
              rows="4" // Increased rows
              placeholder="Any challenges faced, lessons learned, future improvements, or specific technical details you want to highlight."
            />
          </div>

          <div className="pt-6"> {/* Increased padding above button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg rounded-xl shadow-lg font-bold
                ${isSubmitting
                  ? 'bg-green-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Project...
                </>
              ) : (
                <>
                  <FiSave className="mr-3 text-2xl" /> Save Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;