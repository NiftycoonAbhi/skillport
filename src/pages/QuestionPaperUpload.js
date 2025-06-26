import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { FiUpload, FiTrash2, FiExternalLink, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import subjectsByStandard from './subjectsByStandard.json';

function UploadQuestionPaper() {
  const [standard, setStandard] = useState('');
  const [stream, setStream] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [pdfLink, setPdfLink] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [papers, setPapers] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchPapers = async () => {
      if (!standard || !subject) return;
      
      try {
        let q = query(
          collection(db, 'questionPapers'),
          where('standard', '==', standard),
          where('subject', '==', subject)
        );

        if (standard === 'Engineering') {
          q = query(q, 
            where('branch', '==', stream),
            where('semester', '==', semester)
          );
        } else if (standard !== '10th') {
          q = query(q, where('stream', '==', stream));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPapers(data);
      } catch (err) {
        setError('Failed to fetch papers');
        console.error(err);
      }
    };
    
    fetchPapers();
  }, [standard, stream, semester, subject]);

  const getStreams = () => {
    if (!standard || standard === '10th') return [];
    const standardData = subjectsByStandard[standard];
    if (!standardData) return [];
    return Array.isArray(standardData) ? [] : Object.keys(standardData);
  };

  const getSemesters = () => {
    if (standard !== 'Engineering' || !stream) return [];
    const streamData = subjectsByStandard[standard]?.[stream];
    if (!streamData) return [];
    return Object.keys(streamData);
  };

  const getSubjects = () => {
    if (!standard) return [];
    
    // 10th standard
    if (standard === '10th') {
      return Array.isArray(subjectsByStandard['10th']) 
        ? subjectsByStandard['10th'] 
        : [];
    }
    
    // 11th/12th standards
    if (standard === '11th' || standard === '12th') {
      if (!stream) return [];
      const streamData = subjectsByStandard[standard]?.[stream];
      return Array.isArray(streamData) ? streamData : [];
    }
    
    // Engineering
    if (standard === 'Engineering') {
      if (!stream || !semester) return [];
      const semesterData = subjectsByStandard[standard]?.[stream]?.[semester];
      return Array.isArray(semesterData) ? semesterData : [];
    }
    
    return [];
  };

  const handleUpload = async () => {
    if (!title || !pdfLink || !subject) {
      setError('Please fill all required fields');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      
      const paperData = {
        title,
        fileURL: pdfLink,
        subject,
        standard,
        type: 'questionPaper',
        approved: true,
        year,
        createdAt: Timestamp.now(),
        createdBy: 'admin-manual',
      };
      
      if (standard !== '10th') {
        if (standard === 'Engineering') {
          paperData.branch = stream;
          paperData.semester = semester;
        } else {
          paperData.stream = stream;
        }
      }
      
      await addDoc(collection(db, 'questionPapers'), paperData);
      
      // Refresh the papers list
      let q = query(
        collection(db, 'questionPapers'),
        where('standard', '==', standard),
        where('subject', '==', subject)
      );
      
      if (standard === 'Engineering') {
        q = query(q, 
          where('branch', '==', stream),
          where('semester', '==', semester)
        );
      } else if (standard !== '10th') {
        q = query(q, where('stream', '==', stream));
      }
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPapers(data);
      
      setSuccess('Question paper uploaded successfully!');
      setTitle('');
      setPdfLink('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCsvUpload = () => {
    if (!csvFile) {
      setError('Please select a CSV file first');
      return;
    }
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        if (rows.length === 0) {
          setError('CSV file is empty or invalid format');
          return;
        }
        
        setUploading(true);
        setError('');
        
        try {
          for (const row of rows) {
            try {
              if (!row.title || !row.pdfLink || !row.subject || !row.standard) {
                console.warn('Skipping incomplete row:', row);
                continue;
              }
              
              const paperData = {
                title: row.title,
                fileURL: row.pdfLink,
                year: parseInt(row.year) || new Date().getFullYear(),
                standard: row.standard,
                subject: row.subject,
                type: 'questionPaper',
                approved: true,
                createdAt: Timestamp.now(),
                createdBy: 'admin-csv',
              };
              
              if (row.standard !== '10th') {
                if (row.standard === 'Engineering') {
                  if (row.branch) paperData.branch = row.branch;
                  if (row.semester) paperData.semester = row.semester;
                } else {
                  if (row.stream) paperData.stream = row.stream;
                }
              }
              
              await addDoc(collection(db, 'questionPapers'), paperData);
            } catch (err) {
              console.error('Error processing row:', row, err);
            }
          }
          
          // Refresh the papers list
          let q = query(
            collection(db, 'questionPapers'),
            where('standard', '==', standard),
            where('subject', '==', subject)
          );
          
          if (standard === 'Engineering') {
            q = query(q, 
              where('branch', '==', stream),
              where('semester', '==', semester)
            );
          } else if (standard !== '10th') {
            q = query(q, where('stream', '==', stream));
          }
          
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPapers(data);
          
          setSuccess(`${rows.length} question papers uploaded successfully from CSV!`);
          setCsvFile(null);
          setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
          setError('Error uploading some papers from CSV');
          console.error(err);
        } finally {
          setUploading(false);
        }
      },
      error: () => {
        setError('Error parsing CSV file');
        setUploading(false);
      }
    });
  };

  const handleDelete = async (paperId) => {
    if (!window.confirm('Are you sure you want to delete this question paper?')) return;
    
    try {
      setDeletingId(paperId);
      await deleteDoc(doc(db, 'questionPapers', paperId));
      
      setPapers(papers.filter(paper => paper.id !== paperId));
      setSuccess('Question paper deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete question paper');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const renderSelection = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Question Papers</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Select Standard</h3>
            <div className="flex flex-wrap gap-3">
              {['10th', '11th', '12th', 'Engineering'].map((std) => (
                <button
                  key={std}
                  onClick={() => { 
                    setStandard(std); 
                    setStream(''); 
                    setSemester(''); 
                    setSubject(''); 
                  }}
                  className={`px-5 py-2 rounded-full transition-all ${standard === std ? 
                    'bg-blue-600 text-white shadow-md' : 
                    'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                >
                  {std}
                </button>
              ))}
            </div>
          </div>

          {standard && standard !== '10th' && getStreams().length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                {standard === 'Engineering' ? 'Select Branch' : 'Select Stream'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {getStreams().map((str) => (
                  <button
                    key={str}
                    onClick={() => { 
                      setStream(str); 
                      setSemester(''); 
                      setSubject(''); 
                    }}
                    className={`px-5 py-2 rounded-full transition-all ${stream === str ? 
                      'bg-green-600 text-white shadow-md' : 
                      'bg-green-100 text-green-800 hover:bg-green-200'}`}
                  >
                    {str}
                  </button>
                ))}
              </div>
            </div>
          )}

          {standard === 'Engineering' && stream && getSemesters().length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Select Semester</h3>
              <div className="flex flex-wrap gap-3">
                {getSemesters().map((sem) => (
                  <button
                    key={sem}
                    onClick={() => { 
                      setSemester(sem); 
                      setSubject(''); 
                    }}
                    className={`px-5 py-2 rounded-full transition-all ${semester === sem ? 
                      'bg-purple-600 text-white shadow-md' : 
                      'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {((standard === '10th') || (standard && stream && (standard !== 'Engineering' || semester))) && 
            getSubjects().length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Select Subject</h3>
              <div className="flex flex-wrap gap-3">
                {getSubjects().map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubject(sub)}
                    className={`px-5 py-2 rounded-full transition-all ${subject === sub ? 
                      'bg-orange-600 text-white shadow-md' : 
                      'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {subject && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Upload New Question Paper</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Exam 2023"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF URL*</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={pdfLink}
                  onChange={(e) => setPdfLink(e.target.value)}
                  placeholder="https://example.com/exam.pdf"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  placeholder="2023"
                />
              </div>
              
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${uploading ? 
                  'bg-blue-400 cursor-not-allowed' : 
                  'bg-blue-600 hover:bg-blue-700'} transition-colors`}
              >
                {uploading ? 'Uploading...' : 'Upload Question Paper'}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-gray-700">Bulk Upload via CSV</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Upload multiple question papers at once using a CSV file with columns: 
                  title, pdfLink, year, standard, subject, {standard !== '10th' ? (standard === 'Engineering' ? 'branch, semester' : 'stream') : ''}
                </p>
                
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <button
                    onClick={handleCsvUpload}
                    disabled={!csvFile || uploading}
                    className={`py-2 px-4 rounded-md text-white font-medium ${!csvFile || uploading ? 
                      'bg-gray-400 cursor-not-allowed' : 
                      'bg-green-600 hover:bg-green-700'} transition-colors`}
                  >
                    Upload CSV
                  </button>
                </div>
              </div>
              
              {success && (
                <div className="p-3 bg-green-50 text-green-800 rounded-md flex items-start gap-2">
                  <FiCheckCircle className="mt-0.5 text-green-600" />
                  <span>{success}</span>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded-md flex items-start gap-2">
                  <FiXCircle className="mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaperList = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Existing Question Papers</h3>
      
      {papers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                {standard === 'Engineering' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {papers.map((paper) => (
                <tr key={paper.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{paper.title}</div>
                    <div className="text-sm text-gray-500">{paper.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {paper.year}
                  </td>
                  {standard === 'Engineering' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paper.semester}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <a 
                        href={paper.fileURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <FiExternalLink /> View
                      </a>
                      <button
                        onClick={() => handleDelete(paper.id)}
                        disabled={deletingId === paper.id}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <FiTrash2 /> 
                        {deletingId === paper.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No question papers found for this subject.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {renderSelection()}
      {subject && renderPaperList()}
    </div>
  );
}

export default UploadQuestionPaper;