// src/components/ProjectList.js
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '', techStack: '', liveLink: '', githubLink: '', videoLink: '', notes: '' });

  const fetchProjects = async () => {
    const user = auth.currentUser;
    const q = query(collection(db, 'projects'), where('uid', '==', user.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjects(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteDoc(doc(db, 'projects', id));
      fetchProjects();
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
    await updateDoc(doc(db, 'projects', editingProjectId), editData);
    setEditingProjectId(null);
    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">📋 Your Projects</h2>
      {projects.map((project) => (
        <div key={project.id} className="bg-white shadow-md p-4 rounded mb-4">
          {editingProjectId === project.id ? (
            <div className="space-y-2">
              <input className="w-full border p-2" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
              <textarea className="w-full border p-2" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })}></textarea>
              <input className="w-full border p-2" value={editData.techStack} onChange={(e) => setEditData({ ...editData, techStack: e.target.value })} />
              <input className="w-full border p-2" placeholder="Live Link" value={editData.liveLink} onChange={(e) => setEditData({ ...editData, liveLink: e.target.value })} />
              <input className="w-full border p-2" placeholder="GitHub Link" value={editData.githubLink} onChange={(e) => setEditData({ ...editData, githubLink: e.target.value })} />
              <input className="w-full border p-2" placeholder="Video Link" value={editData.videoLink} onChange={(e) => setEditData({ ...editData, videoLink: e.target.value })} />
              <textarea className="w-full border p-2" placeholder="Notes" value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })}></textarea>
              <button className="bg-green-500 text-white px-4 py-1 rounded" onClick={handleUpdate}>Update</button>
              <button className="ml-2 text-gray-600" onClick={() => setEditingProjectId(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold">{project.title}</h3>
              <p className="text-sm text-gray-700">{project.description}</p>
              <p className="text-sm">🛠 {project.techStack}</p>
              {project.liveLink && <p><a href={project.liveLink} target="_blank" rel="noreferrer" className="text-blue-600">🔗 Live</a></p>}
              {project.githubLink && <p><a href={project.githubLink} target="_blank" rel="noreferrer" className="text-blue-600">💻 GitHub</a></p>}
              {project.videoLink && <p><a href={project.videoLink} target="_blank" rel="noreferrer" className="text-blue-600">🎥 Demo</a></p>}
              {project.notes && <p className="text-sm italic">📝 {project.notes}</p>}
              <div className="mt-2 space-x-2">
                <button className="bg-yellow-500 text-white px-4 py-1 rounded" onClick={() => handleEditClick(project)}>Edit</button>
                <button className="bg-red-500 text-white px-4 py-1 rounded" onClick={() => handleDelete(project.id)}>Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
