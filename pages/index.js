import React, { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [url, setUrl] = useState('');
  const [diagramData, setDiagramData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/generate-diagram', { url });
      setDiagramData(response.data);
    } catch (error) {
      console.error('Error generating diagram:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Website Architecture Diagram Generator</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          required
        />
        <button type="submit">Generate Diagram</button>
      </form>
      {loading && <p>Loading...</p>}
      {diagramData && <DiagramComponent data={diagramData} />}
    </div>
  );
}

const DiagramComponent = ({ data }) => {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};