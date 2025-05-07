import React, { useState } from 'react';
import TopicInput from './components/TopicInput';
import CourseOutline from './components/CourseOutline';

function RenderOutlineContent({ outline, level = 0 }) {
  return (
    <div>
      {outline.map(item => (
        <div key={item.id} style={{ marginLeft: level * 24 }}>
          <h3 className="text-xl font-bold mt-4 mb-2">{item.title}</h3>
          <div className="bg-gray-900 rounded p-4 mb-4 text-gray-300 whitespace-pre-line">
            {item.content || '[No content]'}
          </div>
          {item.children && item.children.length > 0 && (
            <RenderOutlineContent outline={item.children} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [outline, setOutline] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-2xl font-bold">CourseGPT</h1>
      </header>
      <main className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-5xl">
          <TopicInput setOutline={setOutline} setLoading={setLoading} />
        </div>
        <div className="w-full max-w-5xl flex flex-1 mt-4 h-[70vh] border border-gray-800 rounded-lg overflow-hidden bg-gray-800 shadow-lg">
          <div className="w-1/3 min-w-[250px] max-w-xs border-r border-gray-700 bg-gray-900 overflow-y-auto">
            <CourseOutline outline={outline} setOutline={setOutline} />
          </div>
          <div className="flex-1 bg-gray-950 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <span className="ml-4 text-lg">Generating...</span>
              </div>
            ) : outline.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">Generate a course to see its content.</div>
            ) : (
              <div className="p-6"><RenderOutlineContent outline={outline} /></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 