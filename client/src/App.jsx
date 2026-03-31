import { useEffect, useState } from 'react';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const API_URL = 'http://localhost:5050';

async function fetchNotes() {
  try {
    const response = await fetch(`${API_URL}/notes`);
    const data = await response.json();
    console.log('Fetched notes:', data);
    setNotes(data);
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!title || !content) return;

    try {
      const reponses = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      });

      if (!reponses.ok) {
        throw new Error('Failed to create note');
      }

      setTitle('');
      setContent('');
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }
  return (
    <div style= {{ padding: '3rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Notes App</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem'}}>
        <input
          type="text"
          placeholder="Add a note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.75rem' }}
        />
      
        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.75rem'}}
        />

        <button type="submit">Add Note</button>
      </form>

      <h2>All Notes</h2>

      {notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        notes.map((note) => (
          <div
            key = {note.id}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            <h3>{note.title}</h3>
            <p>{note.content}</p>
         </div>
        ))
      )}
    </div>
  );
}
export default App;