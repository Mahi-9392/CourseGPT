import React, { useState } from 'react';
import { generateOutline } from '../api/groq';

async function generateContentForOutline(outline, groqFn) {
  async function fillContent(item) {
    let content = '';
    try {
      const raw = await groqFn(item.title);
      content = raw.trim();
    } catch {
      content = '[No content generated]';
    }
    const children = item.children?.length
      ? await Promise.all(item.children.map(fillContent))
      : [];
    return { ...item, content, children };
  }
  return Promise.all(outline.map(fillContent));
}

export default function TopicInput({ setOutline, setLoading }) {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const raw = await generateOutline(topic);
      let outline = [];

      try {
        outline = JSON.parse(raw);
      } catch {
        outline = [{
          id: '1',
          title: raw.split('\n')[0] || topic,
          content: raw,
          children: [],
        }];
      }

      const outlineWithContent = await generateContentForOutline(outline, generateOutline);
      setOutline(outlineWithContent);
    } catch (err) {
      setError('Failed to generate outline. Using placeholder.');
      setOutline([
        {
          id: '1',
          title: 'Introduction to ' + topic,
          content: '[No content generated]',
          children: [
            { id: '1-1', title: 'What is ' + topic + '?', content: '[No content generated]', children: [] },
            { id: '1-2', title: 'History of ' + topic, content: '[No content generated]', children: [] },
          ],
        },
        {
          id: '2',
          title: 'Core Concepts',
          content: '[No content generated]',
          children: [
            { id: '2-1', title: 'Key Terms', content: '[No content generated]', children: [] },
            { id: '2-2', title: 'Examples', content: '[No content generated]', children: [] },
          ],
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleGenerate} className="flex items-center gap-2 w-full">
      <input
        className="flex-1 px-3 py-2 rounded border border-gray-700 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        type="text"
        placeholder="Javascript"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-semibold transition"
      >
        Generate ✨
      </button>
      {error && <span className="text-red-400 ml-4">{error}</span>}
    </form>
  );
}
