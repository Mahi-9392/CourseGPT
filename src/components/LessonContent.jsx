import React, { useState, useEffect, useRef } from 'react';
import { generateOutline } from '../api/groq';

// Helper to find and update an item by id in a nested outline
function updateItemContent(outline, id, fn) {
  return outline.map(item => {
    if (item.id === id) {
      return fn(item);
    } else if (item.children) {
      return { ...item, children: updateItemContent(item.children, id, fn) };
    } else {
      return item;
    }
  });
}

function findItemById(outline, id) {
  for (const item of outline) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function LessonContent({ selected, outline, setOutline, loading }) {
  const [content, setContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!selected) return;
    const item = findItemById(outline, selected);
    setContent(item?.content || '');
    setEditMode(false);
    setError(null);
    // Scroll to top of content area
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selected, outline]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-4 text-lg">Generating...</span>
      </div>
    );
  }

  if (!selected) {
    return <div className="flex items-center justify-center h-full text-gray-400">Select a topic to view its content.</div>;
  }

  const item = findItemById(outline, selected);

  const handleSave = () => {
    setOutline(updateItemContent(outline, selected, (itm) => ({ ...itm, content })));
    setEditMode(false);
  };

  const handleRegenerate = async () => {
    setRegenLoading(true);
    setError(null);
    try {
      // Use Groq API to generate content for this topic
      const data = await generateOutline(item.title);
      let newContent = '';
      if (data && data.choices && data.choices[0] && data.choices[0].text) {
        newContent = data.choices[0].text.trim();
      } else {
        newContent = '[No content generated]';
      }
      setContent(newContent);
      setOutline(updateItemContent(outline, selected, (itm) => ({ ...itm, content: newContent })));
    } catch (err) {
      setError('Failed to regenerate content.');
    }
    setRegenLoading(false);
  };

  return (
    <div ref={contentRef} className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-2">{item?.title}</h2>
      <div className="flex gap-2 mb-2">
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => setEditMode(true)}
          disabled={editMode}
        >
          Edit
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          onClick={handleRegenerate}
          disabled={regenLoading}
        >
          {regenLoading ? 'Regenerating...' : 'Regenerate'}
        </button>
        {editMode && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            onClick={handleSave}
          >
            Save
          </button>
        )}
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="bg-gray-900 rounded p-4 min-h-[200px] mt-2 flex-1">
        {editMode ? (
          <textarea
            className="w-full h-full min-h-[180px] bg-gray-800 text-white rounded p-2"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        ) : (
          <div className="whitespace-pre-line text-gray-300">{content || '[No content yet. Click Regenerate or Edit to add.]'}</div>
        )}
      </div>
    </div>
  );
} 