import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FiEdit2, FiTrash2, FiSave, FiX, FiCode, FiExternalLink, FiGithub, FiYoutube, FiFileText, FiTool } from 'react-icons/fi';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editData, setEditData] = useState({ 
    title: '', 
    description: '', 
    techStack: '', 
    liveLink: '', 
    githubLink: '', 
    videoLink: '', 
    notes: '' 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    const q = query(collection(db, 'projects'), where('uid', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null
      }));
      setProjects(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleEditClick = (project) => {
    setEditingProjectId(project.id);
    setEditData({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      liveLink: project.liveLink || '',
      githubLink: project.githubLink || '',
      videoLink: project.videoLink || '',
      notes: project.notes || ''
    });
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'projects', editingProjectId), {
        ...editData,
        lastUpdated: new Date()
      });
      setEditingProjectId(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <FiCode className="text-2xl text-green-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
      </div>

      {projects.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <p className="text-green-800">You haven't added any projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {editingProjectId === project.id ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack *</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={editData.techStack}
                          onChange={(e) => setEditData({ ...editData, techStack: e.target.value })}
                          placeholder="React, Node.js, MongoDB"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FiExternalLink className="mr-2" /> Live URL
                        </label>
                        <input
                          type="url"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={editData.liveLink}
                          onChange={(e) => setEditData({ ...editData, liveLink: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FiGithub className="mr-2" /> GitHub Repository
                        </label>
                        <input
                          type="url"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={editData.githubLink}
                          onChange={(e) => setEditData({ ...editData, githubLink: e.target.value })}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FiYoutube className="mr-2" /> Demo Video
                        </label>
                        <input
                          type="url"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={editData.videoLink}
                          onChange={(e) => setEditData({ ...editData, videoLink: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows="3"
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiFileText className="mr-2" /> Additional Notes
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      rows="2"
                    />
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <FiSave className="mr-2" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-4">{project.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(project)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <FiTool className="mr-2 text-green-500" />
                      <span>{project.techStack}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {project.liveLink && (
                        <div className="flex items-center">
                          <FiExternalLink className="mr-2 text-green-500" />
                          <a 
                            href={project.liveLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            Live Demo
                          </a>
                        </div>
                      )}
                      {project.githubLink && (
                        <div className="flex items-center">
                          <FiGithub className="mr-2 text-green-500" />
                          <a 
                            href={project.githubLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            View on GitHub
                          </a>
                        </div>
                      )}
                      {project.videoLink && (
                        <div className="flex items-center">
                          <FiYoutube className="mr-2 text-green-500" />
                          <a 
                            href={project.videoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            Watch Demo Video
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {project.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-gray-600 mb-1">
                          <FiFileText className="mr-2" />
                          <span className="font-medium">Notes</span>
                        </div>
                        <p className="text-gray-600 text-sm">{project.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;