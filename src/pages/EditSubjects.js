import React, { useEffect, useState } from 'react';
import subjectsData from './subjectsByStandard.json';
import { FiPlus, FiTrash2, FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const EditSubjects = () => {
  const [subjects, setSubjects] = useState({});
  const [selectedStandard, setSelectedStandard] = useState('');
  const [newStream, setNewStream] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [expandedStreams, setExpandedStreams] = useState({});

  useEffect(() => {
    setSubjects(subjectsData);
  }, []);

  const toggleStream = (stream) => {
    setExpandedStreams(prev => ({
      ...prev,
      [stream]: !prev[stream]
    }));
  };

  const handleAddSubject = (stream) => {
    if (!newSubject.trim()) return;
    const updated = { ...subjects };
    if (selectedStandard === '10th') {
      updated['10th'] = [...updated['10th'], newSubject];
    } else {
      updated[selectedStandard][stream] = [...(updated[selectedStandard][stream] || []), newSubject];
    }
    setSubjects(updated);
    setNewSubject('');
  };

  const handleDeleteSubject = (stream, subjectIndex) => {
    const updated = { ...subjects };
    if (selectedStandard === '10th') {
      updated['10th'].splice(subjectIndex, 1);
    } else {
      updated[selectedStandard][stream].splice(subjectIndex, 1);
    }
    setSubjects(updated);
  };

  const handleAddStream = () => {
    if (!newStream.trim()) return;
    const updated = { ...subjects };
    updated[selectedStandard][newStream] = [];
    setSubjects(updated);
    setNewStream('');
  };

  const handleDeleteStream = (stream) => {
    const updated = { ...subjects };
    delete updated[selectedStandard][stream];
    setSubjects(updated);
  };

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(subjects, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'subjects.json';
    link.click();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-indigo-700">📝 Manage Subjects</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.keys(subjects).map((std) => (
          <button
            key={std}
            onClick={() => {
              setSelectedStandard(std);
              setExpandedStreams({});
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedStandard === std
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-indigo-100'
            }`}
          >
            {std}
          </button>
        ))}
      </div>

      {selectedStandard && (
        <div className="bg-white shadow-lg rounded-xl p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedStandard === '10th' ? 'Subjects for 10th' : `${selectedStandard} - Streams & Subjects`}
          </h2>

          {selectedStandard === '10th' ? (
            <>
              {subjects['10th'].map((sub, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded mb-2">
                  <span>{sub}</span>
                  <button
                    onClick={() => handleDeleteSubject(null, i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}

              <div className="flex mt-4 gap-2">
                <input
                  type="text"
                  placeholder="New Subject"
                  className="border px-3 py-2 rounded-md w-full"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
                <button
                  onClick={() => handleAddSubject(null)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  <FiPlus />
                </button>
              </div>
            </>
          ) : (
            <>
              {Object.entries(subjects[selectedStandard]).map(([stream, subjectList]) => (
                <div key={stream} className="mb-4 border-b pb-2">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-1"
                    onClick={() => toggleStream(stream)}
                  >
                    <h3 className="text-lg font-semibold">{stream}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStream(stream);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                      {expandedStreams[stream] ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </div>

                  {expandedStreams[stream] && (
                    <>
                      {subjectList.map((sub, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded mb-2"
                        >
                          <span>{sub}</span>
                          <button
                            onClick={() => handleDeleteSubject(stream, idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}

                      <div className="flex mt-2 gap-2">
                        <input
                          type="text"
                          placeholder="New Subject"
                          className="border px-3 py-2 rounded-md w-full"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                        />
                        <button
                          onClick={() => handleAddSubject(stream)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add new stream */}
              <div className="flex mt-6 gap-2">
                <input
                  type="text"
                  placeholder="New Stream"
                  className="border px-3 py-2 rounded-md w-full"
                  value={newStream}
                  onChange={(e) => setNewStream(e.target.value)}
                />
                <button
                  onClick={handleAddStream}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  <FiPlus className="inline-block mr-1" />
                  Add Stream
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={handleSave}
          className="bg-indigo-700 text-white px-6 py-3 rounded-md shadow-md hover:bg-indigo-800"
        >
          <FiSave className="inline-block mr-2" />
          Download Updated JSON
        </button>
      </div>
    </div>
  );
};

export default EditSubjects;
