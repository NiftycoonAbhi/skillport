import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function QuestionPaperList() {
  const [questionPapers, setQuestionPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const fetchQuestionPapers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'questionPapers'));
        const papers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Extract unique subjects
        const uniqueSubjects = [...new Set(papers.map((paper) => paper.subject?.toLowerCase()))];

        setQuestionPapers(papers);
        setSubjects(uniqueSubjects);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching question papers:', error);
        setLoading(false);
      }
    };

    fetchQuestionPapers();
  }, []);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleBack = () => {
    setSelectedSubject('');
  };

  const filteredPapers = questionPapers.filter(
    (paper) => paper.subject?.toLowerCase() === selectedSubject.toLowerCase()
  );

  if (loading) {
    return <div className="text-center py-8">Loading question papers...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {!selectedSubject ? (
        <>
          <h2 className="text-2xl font-bold mb-6">Select a Subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer text-center"
                onClick={() => handleSubjectClick(subject)}
              >
                <h3 className="text-xl font-semibold capitalize">{subject}</h3>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold capitalize">{selectedSubject} Question Papers</h2>
            <button
              onClick={handleBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              ← Back to Subjects
            </button>
          </div>

          {filteredPapers.length === 0 ? (
            <p>No question papers found for this subject.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">{paper.title}</h3>
                  <p className="text-gray-600 mb-2 capitalize">Subject: {paper.subject}</p>
                  <a
                    href={paper.link}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Question Paper
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default QuestionPaperList;
