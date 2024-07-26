import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [docxFile, setDocxFile] = useState(null);
  const [xlsxFile, setXlsxFile] = useState(null);
  const [docxContent, setDocxContent] = useState(null);
  const [xlsxContent, setXlsxContent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New state for loading

  const handleDocxFileChange = (event) => {
    setDocxFile(event.target.files[0]);
  };

  const handleXlsxFileChange = (event) => {
    setXlsxFile(event.target.files[0]);
  };

  const handleDocxSubmit = async (event) => {
    event.preventDefault();
    if (!docxFile) {
      setError("Please select a DOCX file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', docxFile);
    setLoading(true); // Set loading to true

    try {
      const response = await axios.post('http://127.0.0.1:8001/upload-docx/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setDocxContent(JSON.stringify(response.data, null, 2)); // Convert JSON to string with indentation
      setError("");
    } catch (error) {
      console.error("Error uploading DOCX file:", error);
      setError("Failed to upload the DOCX file. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after processing
    }
  };

  const handleXlsxSubmit = async (event) => {
    event.preventDefault();
    if (!xlsxFile) {
      setError("Please select an XLSX file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', xlsxFile);
    setLoading(true); // Set loading to true

    try {
      const response = await axios.post('http://127.0.0.1:8001/upload-xlsx/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setXlsxContent(JSON.stringify(response.data.data, null, 2)); // Convert JSON to string with indentation
      setError("");
    } catch (error) {
      console.error("Error uploading XLSX file:", error);
      setError("Failed to upload the XLSX file. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after processing
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Upload and View DOCX/XLSX Files</h1>

        <form onSubmit={handleDocxSubmit}>
          <input type="file" accept=".docx" onChange={handleDocxFileChange} />
          <button type="submit">Upload DOCX</button>
        </form>

        <form onSubmit={handleXlsxSubmit}>
          <input type="file" accept=".xlsx" onChange={handleXlsxFileChange} />
          <button type="submit">Upload XLSX</button>
        </form>

        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Processing...</p>}

        <div className="content">
          <div className="column">
            {docxContent && (
              <div>
                <h2>DOCX File Content:</h2>
                <pre>{docxContent}</pre>
              </div>
            )}
          </div>

          <div className="column">
            {xlsxContent && (
              <div>
                <h2>XLSX File Content:</h2>
                <pre>{xlsxContent}</pre>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;

