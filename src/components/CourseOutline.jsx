import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function EditableTitle({ value, onChange, onBlur }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value);

  return editing ? (
    <input
      className="bg-gray-800 text-white px-1 rounded w-full"
      value={input}
      autoFocus
      onChange={e => setInput(e.target.value)}
      onBlur={() => {
        setEditing(false);
        onChange(input);
        if (onBlur) onBlur();
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          setEditing(false);
          onChange(input);
          if (onBlur) onBlur();
        }
      }}
    />
  ) : (
    <span onClick={() => setEditing(true)} className="cursor-pointer hover:underline">
      {value}
    </span>
  );
}

function OutlineItem({ item, index, selected, setSelected, setOutline, parentPath }) {
  const path = [...parentPath, index];
  const [showAdd, setShowAdd] = useState(false);

  const updateOutline = (fn) => {
    setOutline(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let node = copy;
      for (let i = 0; i < path.length - 1; i++) node = node[path[i]].children;
      fn(node[path[path.length - 1]], node, path[path.length - 1]);
      return copy;
    });
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group flex flex-col border-l-2 pl-2 my-1 ${
            selected === item.id ? 'bg-purple-900 text-purple-300' : ''
          }`}
        >
          <div className="flex items-center gap-1">
            <span {...provided.dragHandleProps} className="cursor-move text-gray-500">⋮</span>
            <EditableTitle
              value={item.title}
              onChange={val => updateOutline((node) => { node.title = val; })}
            />
            <button
              className="ml-1 text-green-400 hover:text-green-300 text-xs"
              title="Add sub-item"
              onClick={() => setShowAdd(true)}
            >+</button>
            <button
              className="ml-1 text-red-400 hover:text-red-300 text-xs"
              title="Delete"
              onClick={() => updateOutline((_, parent, idx) => parent.splice(idx, 1))}
            >🗑️</button>
          </div>

          {showAdd && (
            <form
              className="flex gap-1 mt-1"
              onSubmit={e => {
                e.preventDefault();
                const val = e.target.elements[0].value;
                if (val) updateOutline(node => {
                  node.children = node.children || [];
                  node.children.push({ id: Date.now().toString(), title: val, children: [] });
                });
                setShowAdd(false);
              }}
            >
              <input className="bg-gray-800 text-white px-1 rounded text-xs" autoFocus />
              <button type="submit" className="text-green-400 text-xs">Add</button>
              <button type="button" className="text-gray-400 text-xs" onClick={() => setShowAdd(false)}>Cancel</button>
            </form>
          )}

          {item.children?.length > 0 && (
            <Droppable droppableId={item.id} type="OUTLINE">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {item.children.map((child, idx) => (
                    <OutlineItem
                      key={child.id}
                      item={child}
                      index={idx}
                      selected={selected}
                      setSelected={setSelected}
                      setOutline={setOutline}
                      parentPath={[...path, 'children']}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}

          <div
            className={`w-full h-4 cursor-pointer ${selected === item.id ? 'bg-purple-800' : ''}`}
            onClick={() => setSelected(item.id)}
          />
        </div>
      )}
    </Draggable>
  );
}

export default function CourseOutline({ outline, setSelected, selected, setOutline }) {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(outline);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setOutline(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full overflow-y-auto p-2 pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <div className="font-bold text-lg mb-2">Course Outline</div>
        <Droppable droppableId="root" type="OUTLINE">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {outline.length === 0 && <div className="text-gray-400">No outline yet.</div>}
              {outline.map((item, idx) => (
                <OutlineItem
                  key={item.id}
                  item={item}
                  index={idx}
                  selected={selected}
                  setSelected={setSelected}
                  setOutline={setOutline}
                  parentPath={[]}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <div className="mt-2">
          <button
            className="w-full py-1 text-green-400 hover:text-green-300 bg-gray-800 rounded text-xs"
            onClick={() =>
              setOutline(prev => [
                ...prev,
                { id: Date.now().toString(), title: 'New Module', children: [] },
              ])
            }
          >
            + Add Module
          </button>
        </div>
      </div>
    </DragDropContext>
  );
}
