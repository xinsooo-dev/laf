import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, Package, Users, AlertCircle, BarChart3, MapPin, Target, CheckCircle, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';

const SystemReports = () => {
    const [loading, setLoading] = useState(true);
    const [activeReport, setActiveReport] = useState('summary');
    const [reportData, setReportData] = useState({});
    const [error, setError] = useState('');

    const fetchReportData = async (reportType) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_ENDPOINTS.ADMIN.REPORTS(reportType));
            const result = await response.json();

            if (result.success) {
                setReportData(prev => ({
                    ...prev,
                    [reportType]: result.data
                }));
            } else {
                setError(result.message || 'Failed to fetch report data');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData(activeReport);
    }, [activeReport]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatMonth = (monthString) => {
        return new Date(monthString + '-01').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

    const renderSummaryReport = () => {
        const data = reportData.summary;
        if (!data) return null;

        return (
            <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-gray-600">Total Items</p>
                                <p className="text-2xl md:text-3xl font-bold text-blue-600">{data.overview?.total_items || 0}</p>
                            </div>
                            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-gray-600">Success Rate</p>
                                <p className="text-2xl md:text-3xl font-bold text-green-600">{data.success_rate || 0}%</p>
                            </div>
                            <Target className="h-6 w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-gray-600">Recent Reports</p>
                                <p className="text-2xl md:text-3xl font-bold text-orange-600">{data.recent_activity?.recent_reports || 0}</p>
                            </div>
                            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-orange-600 flex-shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Detailed Statistics */}
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {/* Item Status Breakdown */}
                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Item Status Breakdown</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center text-sm">
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                    Lost
                                </span>
                                <span className="font-medium">{data.overview?.total_lost || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Found
                                </span>
                                <span className="font-medium">{data.overview?.total_found || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center text-sm">
                                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                                    Claimed
                                </span>
                                <span className="font-medium">{data.overview?.total_claimed || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthlyReport = () => {
        const data = reportData.monthly;
        if (!data) return null;

        return (
            <div className="space-y-6">
                {/* Monthly Items Chart */}
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Monthly Item Reports (Last 12 Months)</h3>
                    <div className="space-y-4">
                        {data.items?.map((month, index) => (
                            <div key={index} className="border-b border-gray-200 pb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-700">{formatMonth(month.month)}</span>
                                    <span className="text-sm text-gray-500">Total: {month.total}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-red-600 font-medium">{month.lost}</div>
                                        <div className="text-gray-500">Lost</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-green-600 font-medium">{month.found}</div>
                                        <div className="text-gray-500">Found</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-blue-600 font-medium">{month.claimed}</div>
                                        <div className="text-gray-500">Claimed</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderLocationReport = () => {
        const data = reportData.locations;
        if (!data) return null;

        return (
            <div className="space-y-6">
                {/* Top Locations */}
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Most Common Locations</h3>
                    <div className="space-y-3">
                        {data.top_locations?.map((location, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="font-medium">{location.location}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{location.count} total</div>
                                    <div className="text-xs text-gray-500">
                                        {location.lost_count} lost, {location.found_count} found
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };


    const renderTrendReport = () => {
        const data = reportData.trends;
        if (!data) return null;

        return (
            <div className="space-y-6">
                {/* Daily Activity */}
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Daily Activity (Last 30 Days)</h3>
                    <div className="space-y-2">
                        {data.daily_activity?.map((day, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-medium">{formatDate(day.date)}</span>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{day.total_reports} total</div>
                                    <div className="text-xs text-gray-500">
                                        {day.lost_reports} lost, {day.found_reports} found
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Item Trends */}
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Item Trends (Last 90 Days)</h3>
                    <div className="space-y-3">
                        {data.item_trends?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div>
                                    <div className="font-medium">{item.item_name}</div>
                                    <div className="text-xs text-gray-500">Last reported: {formatDate(item.last_reported)}</div>
                                </div>
                                <span className="text-sm font-medium text-blue-600">{item.count} reports</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const reportTabs = [
        { id: 'summary', name: 'System Summary', icon: BarChart3 },
        { id: 'monthly', name: 'Monthly Reports', icon: Calendar },
        { id: 'locations', name: 'Location Analytics', icon: MapPin }
    ];

    return (
        <div className="w-full max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 md:mb-6">
                <div className="min-w-0">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900 break-words">System Reports</h2>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Analytics and Statistics</p>
                </div>
                <div className="flex space-x-2 md:space-x-3 flex-shrink-0">
                    <button
                        onClick={() => fetchReportData(activeReport)}
                        className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

                {/* Report Tabs */}
                <div className="flex flex-col md:flex-row md:space-x-1 space-y-2 md:space-y-0 mb-4 md:mb-6 bg-gray-100 p-2 md:p-1 rounded-lg w-full overflow-hidden">
                    {reportTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveReport(tab.id)}
                                className={`flex items-center justify-center md:justify-start px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors w-full md:w-auto ${activeReport === tab.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading report data...</span>
                    </div>
                )}

            {/* Report Content */}
            {!loading && (
                <div>
                    {activeReport === 'summary' && renderSummaryReport()}
                    {activeReport === 'monthly' && renderMonthlyReport()}
                    {activeReport === 'locations' && renderLocationReport()}
                    {activeReport === 'trends' && renderTrendReport()}
                </div>
            )}
        </div>
    );
};

export default SystemReports;
