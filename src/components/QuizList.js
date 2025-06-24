import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed

export default function Quiz() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'quizzes'));
        const allQuizzes = snapshot.docs.map(doc => doc.data());
        const uniqueSubjects = [
          ...new Set(allQuizzes.map(q => q.subject?.toLowerCase()))
        ];
        setSubjects(uniqueSubjects);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectSelect = async (subject) => {
    setSelectedSubject(subject);
    setQuizLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'quizzes'));
      const allQuizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filtered = allQuizzes.filter(
        q => q.subject?.toLowerCase() === subject.toLowerCase()
      );

      setQuizzes(filtered);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedSubject('');
    setQuizzes([]);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {!selectedSubject ? (
        <>
          <h2 className="text-2xl font-bold mb-6">Select a Subject</h2>
          {loading ? (
            <p>Loading subjects...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer text-center"
                  onClick={() => handleSubjectSelect(subject)}
                >
                  <h3 className="text-xl font-semibold capitalize">{subject}</h3>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold capitalize">{selectedSubject} Quizzes</h2>
            <button
              onClick={handleBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              ← Back to Subjects
            </button>
          </div>

          {quizLoading ? (
            <p>Loading quizzes...</p>
          ) : quizzes.length === 0 ? (
            <p>No quizzes found for this subject.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-2">Duration: {quiz.duration} mins</p>
                  <a
                    href={quiz.link}
                    className="inline-block bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Attend Test
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
