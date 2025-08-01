'use client';
import React, { useState, useMemo } from 'react';
import { TopStudent } from '@/services/types/adminDashboardResponse';
import { formatEducationalText } from '@/utils/formatters';

interface StudentsTabProps {
  topStudents: TopStudent[];
}

const StudentsTab: React.FC<StudentsTabProps> = ({ topStudents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('studentName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStudent, setSelectedStudent] = useState<TopStudent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const filteredAndSortedStudents = useMemo(() => {
    const filtered = topStudents.filter(student => {
      const search = searchTerm.trim().toLowerCase();
      return (
        student.studentName.trim().toLowerCase().includes(search) ||
        student.examNumber.trim().toLowerCase().includes(search) ||
        (student.school || '').trim().toLowerCase().includes(search) ||
        (student.class || '').trim().toLowerCase().includes(search)
      );
    });

    // Sort students
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortBy === 'totalScore') {
        aValue = a.totalScore;
        bValue = b.totalScore;
      } else if (sortBy === 'position') {
        aValue = a.position;
        bValue = b.position;
      } else if (sortBy === 'studentName') {
        aValue = a.studentName;
        bValue = b.studentName;
      } else if (sortBy === 'examNumber') {
        aValue = a.examNumber;
        bValue = b.examNumber;
      } else if (sortBy === 'school') {
        aValue = a.school || '';
        bValue = b.school || '';
      } else if (sortBy === 'class') {
        aValue = a.class || '';
        bValue = b.class || '';
      } else {
        aValue = a[sortBy as keyof TopStudent];
        bValue = b[sortBy as keyof TopStudent];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [topStudents, searchTerm, sortBy, sortOrder]);

  // Pagination logic
  const totalStudents = filteredAndSortedStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const paginatedStudents = filteredAndSortedStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  // Reset to first page if search/filter changes and current page is out of range
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // Helper for pagination numbers with ellipsis
  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'bg-amber-500/10 border-amber-500/20';
    if (score >= 60) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (position === 2) return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    if (position === 3) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  const averageScore = Math.round(
    filteredAndSortedStudents.reduce((sum, student) => sum + Math.round(student.totalScore / 7), 0) / totalStudents
  );

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Students Management</h1>
            <p className="text-gray-300 text-lg">Comprehensive student records and performance analytics</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalStudents}</div>
              <div className="text-sm text-gray-400">Total Students</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</div>
              <div className="text-sm text-gray-400">Average Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Controls */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-3">Search Students</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, exam number, school, LGA, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSortBy('studentName');
                setSortOrder('asc');
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Students Table */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-black/40 to-black/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('studentName')}>
                  <div className="flex items-center gap-2">
                    <span>👤 Student</span>
                    {sortBy === 'studentName' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('examNumber')}>
                  <div className="flex items-center gap-2">
                    <span>🆔 Exam No.</span>
                    {sortBy === 'examNumber' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('schoolName')}>
                  <div className="flex items-center gap-2">
                    <span>🏫 School</span>
                    {sortBy === 'schoolName' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('class')}>
                  <div className="flex items-center gap-2">
                    <span>📚 Class</span>
                    {sortBy === 'class' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('totalScore')}>
                  <div className="flex items-center gap-2">
                    <span>📊 Total</span>
                    {sortBy === 'totalScore' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('averageScore')}>
                  <div className="flex items-center gap-2">
                    <span>📈 Average</span>
                    {sortBy === 'averageScore' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => handleSort('position')}>
                  <div className="flex items-center gap-2">
                    <span>🏆 Position</span>
                    {sortBy === 'position' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-white/5 transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        student.gender === 'MALE' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                      }`}>
                        {student.gender === 'MALE' ? '👨' : '👩'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors duration-200">{formatEducationalText(student.studentName)}</div>
                        <div className="text-sm text-gray-400">{student.gender === 'MALE' ? 'Male' : 'Female'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-300 bg-black/20 px-2 py-1 rounded">{student.examNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                                            <div className="text-sm font-medium text-white">{formatEducationalText(student.school || 'N/A')}</div>
                      <div className="text-sm text-gray-400">{formatEducationalText(student.class || 'N/A')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {formatEducationalText(student.class || 'N/A')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBgColor(student.totalScore)}`}>
                      <span className={`${getScoreColor(student.totalScore)}`}>{student.totalScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBgColor(Math.round(student.totalScore / 7))}`}>
                      <span className={`${getScoreColor(Math.round(student.totalScore / 7))}`}>{Math.round(student.totalScore / 7)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPositionBadge(student.position)}`}>
                      {student.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowDetails(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium hover:underline"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Prev
            </button>
            {getPageNumbers().map((num, idx) =>
              num === '...'
                ? <span key={idx} className="px-2 text-gray-400">...</span>
                : <button
                    key={num as number}
                    onClick={() => setCurrentPage(num as number)}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === num ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-blue-700 hover:text-white'}`}
                  >
                    {num}
                  </button>
            )}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Last
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Student Details Modal */}
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl p-6 border-b border-white/10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                    selectedStudent.gender === 'MALE' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                  }`}>
                    {selectedStudent.gender === 'MALE' ? '👨' : '👩'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{formatEducationalText(selectedStudent.studentName)}</h3>
                    <p className="text-gray-400">{selectedStudent.examNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📊</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPositionBadge(selectedStudent.position)}`}>
                      Position {selectedStudent.position}
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(selectedStudent.totalScore)}`}>
                    {selectedStudent.totalScore}
                  </div>
                  <div className="text-sm text-gray-400">Total Score</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">📈</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(Math.round(selectedStudent.totalScore / 7))}`}>
                    {Math.round(selectedStudent.totalScore / 7)}%
                  </div>
                  <div className="text-sm text-gray-400">Average Score</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-400">
                    {selectedStudent.position}
                  </div>
                  <div className="text-sm text-gray-400">Class Position</div>
                </div>
              </div>

              {/* Basic Info and School Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">👤</span>
                    Basic Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">Student Name</span>
                      <span className="text-white font-medium">{formatEducationalText(selectedStudent.studentName)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">Exam Number</span>
                      <span className="text-white font-mono">{selectedStudent.examNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">Gender</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedStudent.gender === 'MALE' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                      }`}>
                        {selectedStudent.gender === 'MALE' ? 'Male' : 'Female'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Class</span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {formatEducationalText(selectedStudent.class)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🏫</span>
                    School Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">School Name</span>
                      <span className="text-white font-medium text-right">{formatEducationalText(selectedStudent.school || 'N/A')}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">Class</span>
                      <span className="text-white font-medium">{formatEducationalText(selectedStudent.class || 'N/A')}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Position in Class</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPositionBadge(selectedStudent.position)}`}>
                        {selectedStudent.position}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="bg-black/20 rounded-xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <span className="mr-2">📊</span>
                  Performance Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-sm text-gray-400 mb-2">Total Score</div>
                    <div className="text-2xl font-bold text-blue-400">{selectedStudent.totalScore}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
                    <div className="text-sm text-gray-400 mb-2">Average Score</div>
                    <div className="text-2xl font-bold text-green-400">{Math.round(selectedStudent.totalScore / 7)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab; 