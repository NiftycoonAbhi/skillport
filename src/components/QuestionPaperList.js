import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import subjectsByStandard from '../pages/subjectsByStandard.json';

function QuestionPaperList() {
  const [questionPapers, setQuestionPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentlyViewingPDF, setCurrentlyViewingPDF] = useState(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'questionPapers'));
        const papers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestionPapers(papers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching question papers:', error);
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleBack = () => {
    if (currentlyViewingPDF) {
      setCurrentlyViewingPDF(null);
    } else if (selectedSubject) {
      setSelectedSubject('');
    } else if (selectedStream) {
      setSelectedStream('');
    } else {
      setSelectedStandard('');
    }
  };

  const getSubjects = () => {
    if (selectedStandard === '10th') {
      return subjectsByStandard['10th'];
    } else {
      return subjectsByStandard[selectedStandard]?.[selectedStream] || [];
    }
  };

  const filteredPapers = questionPapers.filter((paper) => {
    if (!paper.approved) return false;
    if (paper.standard !== selectedStandard) return false;
    if (selectedStandard !== '10th' && paper.branch !== selectedStream) return false;
    return paper.subject?.toLowerCase() === selectedSubject.toLowerCase();
  });

  const getPDFViewerUrl = (url) => {
    return url.replace('/view?usp=sharing', '/preview?rm=minimal&toolbar=0&navpanes=0&scrollbar=0');
  };

  if (loading) {
    return <div className="text-center py-8">Loading question papers...</div>;
  }

  if (currentlyViewingPDF) {
    return (
      <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <span className="mr-2">←</span> Back to Papers
          </button>
          
          <div className="mt-4 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}, 
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="w-full h-[75vh] bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
          <iframe
            src={getPDFViewerUrl(currentlyViewingPDF)}
            title="PDF Viewer"
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">SkillPort</h1>
        <p className="text-gray-600">Student Learning Distributed</p>
      </div>

      {!selectedStandard ? (
        <StandardSelectionView 
          setSelectedStandard={setSelectedStandard} 
          standards={Object.keys(subjectsByStandard)}
        />
      ) : !selectedSubject ? (
        selectedStandard === '10th' ? (
          <SubjectSelectionView
            title={`Subjects - ${selectedStandard}`}
            items={subjectsByStandard['10th']}
            onSelect={setSelectedSubject}
            onBack={handleBack}
          />
        ) : !selectedStream ? (
          <StreamSelectionView
            standard={selectedStandard}
            streams={Object.keys(subjectsByStandard[selectedStandard] || {})}
            onSelect={setSelectedStream}
            onBack={handleBack}
          />
        ) : (
          <SubjectSelectionView
            title={`Subjects - ${selectedStream} (${selectedStandard})`}
            items={getSubjects()}
            onSelect={setSelectedSubject}
            onBack={handleBack}
          />
        )
      ) : (
        <QuestionPapersView
          papers={filteredPapers}
          selectedSubject={selectedSubject}
          selectedStandard={selectedStandard}
          selectedStream={selectedStream}
          onBack={handleBack}
          onViewPDF={setCurrentlyViewingPDF}
        />
      )}
    </div>
  );
}

// Component for selecting standard
const StandardSelectionView = ({ setSelectedStandard, standards }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-xl font-bold mb-6 text-gray-800">Select a Standard</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {standards.map((std) => (
        <div
          key={std}
          onClick={() => setSelectedStandard(std)}
          className="bg-blue-50 p-6 rounded-lg cursor-pointer text-center hover:bg-blue-100 transition-colors border border-blue-100"
        >
          <h3 className="text-lg font-semibold text-blue-800">{std}</h3>
        </div>
      ))}
    </div>
  </div>
);

// Component for selecting stream
const StreamSelectionView = ({ standard, streams, onSelect, onBack }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800">Select a Stream - {standard}</h2>
      <button 
        onClick={onBack} 
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back
      </button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {streams.map((stream) => (
        <div
          key={stream}
          onClick={() => onSelect(stream)}
          className="bg-blue-50 p-6 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-100 text-center"
        >
          <h3 className="text-lg font-semibold text-blue-800">{stream}</h3>
        </div>
      ))}
    </div>
  </div>
);

// Component for selecting subject
const SubjectSelectionView = ({ title, items, onSelect, onBack }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <button 
        onClick={onBack} 
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back
      </button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((subject) => (
        <div
          key={subject}
          onClick={() => onSelect(subject)}
          className="bg-blue-50 p-6 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-100 text-center capitalize"
        >
          <h3 className="text-lg font-semibold text-blue-800">{subject}</h3>
        </div>
      ))}
    </div>
  </div>
);

// Component for displaying question papers
const QuestionPapersView = ({ papers, selectedSubject, selectedStandard, selectedStream, onBack, onViewPDF }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800 capitalize">
        {selectedSubject} - {selectedStandard}
        {selectedStream && ` (${selectedStream})`}
      </h2>
      <button 
        onClick={onBack} 
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back
      </button>
    </div>

    {papers.length === 0 ? (
      <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
        <p className="text-gray-600">No question papers found for this subject.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <div key={paper.id} className="bg-blue-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-blue-100">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">{paper.title}</h3>
            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-600 text-sm">
                {paper.year && `Year: ${paper.year}`}
              </span>
              <button
                onClick={() => onViewPDF(paper.fileURL)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
              >
                View PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default QuestionPaperList;