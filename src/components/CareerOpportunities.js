import React from 'react';
import { FiArrowLeft, FiBriefcase, FiCalendar, FiExternalLink, FiBook } from 'react-icons/fi';
import jobsByStandard from '../data/jobsByStandard.json';

const CareerOpportunities = ({ onClose }) => {
  const [selectedStandard, setSelectedStandard] = React.useState(null);
  const [selectedJobType, setSelectedJobType] = React.useState(null);
  const [selectedJob, setSelectedJob] = React.useState(null);

  const standards = Object.keys(jobsByStandard);
  const jobTypes = ['Government Jobs', 'Private Jobs'];

  const handleBack = () => {
    if (selectedJob) {
      setSelectedJob(null);
    } else if (selectedJobType) {
      setSelectedJobType(null);
    } else if (selectedStandard) {
      setSelectedStandard(null);
    } else {
      onClose();
    }
  };

  const getJobCount = (standard, type) => {
    return jobsByStandard[standard]?.[type]?.length || 0;
  };

  const getTotalJobsForStandard = (standard) => {
    return getJobCount(standard, 'Government Jobs') + getJobCount(standard, 'Private Jobs');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          {selectedJob ? (
            <>
              <FiBriefcase className="mr-2 text-blue-600" />
              {selectedJob.title}
            </>
          ) : selectedJobType ? (
            <>
              <FiBriefcase className="mr-2 text-blue-600" />
              {selectedJobType} - {selectedStandard}
            </>
          ) : selectedStandard ? (
            <>
              <FiBook className="mr-2 text-blue-600" />
              {selectedStandard} Opportunities
            </>
          ) : (
            <>
              <FiBriefcase className="mr-2 text-blue-600" />
              Career Opportunities
            </>
          )}
        </h2>
        <button 
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
        >
          {selectedJob || selectedJobType || selectedStandard ? (
            <>
              <FiArrowLeft className="mr-1" />
              Back
            </>
          ) : (
            ''
          )}
        </button>
      </div>

      {!selectedStandard ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standards.map((standard) => {
            const totalJobs = getTotalJobsForStandard(standard);
            return (
              <div
                key={standard}
                onClick={() => totalJobs > 0 && setSelectedStandard(standard)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  totalJobs > 0
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md border border-blue-100 hover:border-blue-200'
                    : 'bg-gray-100 border border-gray-200 text-gray-400'
                }`}
              >
                <div className="flex items-start">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <FiBook className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{standard}</h3>
                    <p className="text-sm mt-1">
                      {totalJobs > 0
                        ? `${totalJobs} opportunities available`
                        : 'No opportunities available'}
                    </p>
                    <div className="flex mt-3 space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {getJobCount(standard, 'Government Jobs')} Govt
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {getJobCount(standard, 'Private Jobs')} Private
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !selectedJobType ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobTypes.map((type) => {
            const jobCount = getJobCount(selectedStandard, type);
            return (
              <div
                key={type}
                onClick={() => jobCount > 0 && setSelectedJobType(type)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  jobCount > 0
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md border border-blue-100 hover:border-blue-200'
                    : 'bg-gray-100 border border-gray-200 text-gray-400'
                }`}
              >
                <div className="flex items-start">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <FiBriefcase className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{type}</h3>
                    <p className="text-sm mt-1">
                      {jobCount > 0
                        ? `${jobCount} opportunities available`
                        : 'No opportunities available'}
                    </p>
                    <div className="mt-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {selectedStandard} level
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !selectedJob ? (
        <div className="space-y-4">
          {jobsByStandard[selectedStandard]?.[selectedJobType]?.length > 0 ? (
            jobsByStandard[selectedStandard][selectedJobType].map((job, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedJob(job)}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl cursor-pointer hover:shadow-md transition-all border border-blue-100 hover:border-blue-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-blue-800">{job.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <FiExternalLink className="text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <FiCalendar className="mr-1" />
                  Last Date: {new Date(job.lastDate).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl text-center border border-blue-100">
              <FiBriefcase className="mx-auto text-4xl text-blue-400 mb-3" />
              <p className="text-gray-600">No opportunities available in this category</p>
              <p className="text-sm text-gray-500 mt-1">Check back later for new opportunities</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-xl text-blue-800 mb-2">{selectedJob.title}</h3>
            <p className="text-gray-700 mb-4">{selectedJob.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-1">Last Date</h4>
                <p className="flex items-center">
                  <FiCalendar className="mr-2 text-blue-600" />
                  {new Date(selectedJob.lastDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-1">Job Type</h4>
                <p className="flex items-center">
                  <FiBriefcase className="mr-2 text-blue-600" />
                  {selectedJobType}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-1">Qualification</h4>
                <p className="flex items-center">
                  <FiBook className="mr-2 text-blue-600" />
                  {selectedStandard}
                </p>
              </div>
            </div>
            
            <a 
              href={selectedJob.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <FiExternalLink className="mr-2" />
              Apply Now
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerOpportunities;