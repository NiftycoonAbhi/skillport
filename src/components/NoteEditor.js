import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ReactMarkdown from 'react-markdown';

function NoteEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;

    await addDoc(collection(db, 'notes'), {
      uid,
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setTitle('');
    setContent('');
    setTags('');
    alert('Note saved!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">📝 Add New Note</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          required
        />
        <textarea
          className="w-full h-40 p-2 border rounded font-mono"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note in markdown..."
          required
        />
        <input
          className="w-full p-2 border rounded"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated, e.g., Java, DSA)"
        />
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">
          Save Note
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">🔍 Preview</h3>
        <div className="p-4 bg-gray-100 rounded prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;
