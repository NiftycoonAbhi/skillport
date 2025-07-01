import React, { useState } from 'react';
import jobsByStandard from '../data/jobsByStandard.json';

const JobPortal = ({ standard, onClose }) => {
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const jobTypes = ['Government Jobs', 'Private Jobs'];
  const jobs = jobsByStandard[standard] || {};

  const handleBack = () => {
    if (selectedJob) {
      setSelectedJob(null);
    } else if (selectedJobType) {
      setSelectedJobType(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedJob ? selectedJob.title : 
             selectedJobType ? `${selectedJobType} - ${standard}` : 
             `Career Opportunities - ${standard}`}
          </h2>
          {!selectedJobType && !selectedJob && (
            <p className="text-gray-500 text-sm mt-1">Browse available jobs for your qualification</p>
          )}
        </div>
        <button 
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all shadow-sm"
          aria-label={selectedJob || selectedJobType ? 'Back' : 'Close'}
        >
          {selectedJob || selectedJobType ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {!selectedJobType ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobTypes.map((type) => (
            <div
              key={type}
              onClick={() => jobs[type]?.length > 0 ? setSelectedJobType(type) : null}
              className={`p-5 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                jobs[type]?.length > 0 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 shadow-sm' 
                  : 'bg-gray-50 border border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${
                  jobs[type]?.length > 0 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {type.includes('Government') ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{type}</h3>
                  <p className={`text-sm mt-1 ${
                    jobs[type]?.length > 0 ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {jobs[type]?.length > 0 ? 
                      `${jobs[type].length} ${jobs[type].length === 1 ? 'opportunity' : 'opportunities'} available` : 
                      'Currently no opportunities'}
                  </p>
                </div>
                {jobs[type]?.length > 0 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !selectedJob ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Showing {jobs[selectedJobType]?.length} {selectedJobType.toLowerCase()}</h3>
            <div className="border-t border-gray-200 pt-3 space-y-3">
              {jobs[selectedJobType]?.length > 0 ? (
                jobs[selectedJobType].map((job, index) => (
                  <div 
                    key={index} 
                    onClick={() => setSelectedJob(job)}
                    className="p-4 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-all border border-gray-100 hover:border-blue-200 flex items-start"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-800">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Apply by {new Date(job.lastDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))
              ) : (
                <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 mt-2">No jobs available in this category</p>
                  <p className="text-sm text-gray-500 mt-1">Check back later for new opportunities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">{selectedJob.title}</h3>
                <div className="mt-1 flex items-center text-sm text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {selectedJobType}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</h4>
                <p className="mt-1 text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Date</h4>
                  <p className="mt-1 font-medium text-gray-700">
                    {new Date(selectedJob.lastDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {selectedJob.salary && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary</h4>
                    <p className="mt-1 font-medium text-gray-700">{selectedJob.salary}</p>
                  </div>
                )}
                {selectedJob.location && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</h4>
                    <p className="mt-1 font-medium text-gray-700">{selectedJob.location}</p>
                  </div>
                )}
              </div>

              {selectedJob.requirements && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-4">Requirements</h4>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-gray-700">
                    {selectedJob.requirements.split('\n').map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <a 
                  href={selectedJob.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Apply Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
                <p className="text-xs text-gray-500 mt-2">You'll be redirected to the official application page</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPortal;