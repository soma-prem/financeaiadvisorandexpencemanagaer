'use client'

import { UploadComponent } from './components/UploadComponent';
import { ExpenseChart } from './components/ExpenseChart';
import { DeleteButton } from './components/DeleteButton';
import { AiAssistant } from './components/AiAssistant';
import { BackendCharts } from './components/BackendCharts';
import { fetchExpenses } from '../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [backendConnected, setBackendConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('sb-token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch expenses
    const loadExpenses = async () => {
      try {
        const token = localStorage.getItem('sb-token');
        if (token) {
          const data = await fetchExpenses(token);
          setExpenses(data);
        }
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        if (error.message === "Unauthorized") {
          localStorage.removeItem('sb-token');
          router.push('/login');
          return;
        }
        setBackendConnected(false);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Finance Manager</h1>
              <p className="text-gray-600 mt-1">Track and manage your expenses</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Total Spending</p>
                <p className="text-2xl font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('sb-token');
                  router.push('/login');
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Backend Connection Warning */}
        {!backendConnected && (
          <section className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm">⚠️</span>
              </div>
              <div>
                <p className="font-medium text-amber-900">Backend server is not running</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please start the backend server: <code className="bg-amber-100 px-2 py-1 rounded text-xs">cd backend && uvicorn main:app --reload</code>
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'charts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Charts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'assistant'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assistant
            </button>
          </nav>
        </div>

        {activeTab === 'upload' && (
          <section className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h2>
            <p className="text-sm text-gray-600 mb-6">Upload receipt images or bank statements (PDF)</p>
            <UploadComponent />
          </section>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">{expenses.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">📊</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Categories</p>
                    <p className="text-2xl font-semibold text-gray-900">{[...new Set(expenses.map(e => e.category))].length}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">🏷️</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Avg Transaction</p>
                    <p className="text-2xl font-semibold text-gray-900">₹{expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : '0'}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600">💰</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h2>
                <ExpenseChart data={expenses} />
              </section>
              
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Insights</h2>
                <div className="space-y-3">
                  {totalAmount > 20000 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <span className="text-red-600">⚠️</span>
                      <p className="text-sm text-red-800">High spending detected. Consider saving 20% more.</p>
                    </div>
                  )}
                  {expenses.some((e) => e.category === 'Food') && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-600">🍔</span>
                      <p className="text-sm text-orange-800">Food expenses are high. Try meal planning.</p>
                    </div>
                  )}
                  {expenses.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600">📈</span>
                      <p className="text-sm text-blue-800">Most recent: ₹{expenses[0]?.amount} ({expenses[0]?.category})</p>
                    </div>
                  )}
                  {expenses.length === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">📄</span>
                      <p className="text-sm text-gray-800">No transactions yet. Upload your first receipt!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.sender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.receiver}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">₹{tx.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <DeleteButton id={tx.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expenses.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">📊</div>
                    <p className="text-gray-500">No transactions found</p>
                    <p className="text-sm text-gray-400 mt-1">Upload a receipt to get started</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === 'charts' && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <BackendCharts />
          </section>
        )}

        {activeTab === 'assistant' && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <AiAssistant />
          </section>
        )}

      </div>

    </main>
  );
}
