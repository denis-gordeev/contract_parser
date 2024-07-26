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
  const [isDOCXUploaded, setIsDOCXUploaded] = useState(false);
  const [isXLSXUploaded, setIsXLSXUploaded] = useState(false);
  const [streamingText, setStreamingText] = useState([]);

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
      setIsDOCXUploaded(true);

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
      setIsXLSXUploaded(true);
    } catch (error) {
      console.error("Error uploading XLSX file:", error);
      setError("Failed to upload the XLSX file. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after processing
    }
  };

  const handleAnalysis = () => {
    setLoading(true);
    setStreamingText([]);

    const eventSource = new EventSource('http://127.0.0.1:8001/analyze/');

    eventSource.onmessage = function (event) {
      console.log("Raw event data:", event.data); // Add this line
      if (event.data === "[END]") {
        setLoading(false);
        eventSource.close();
      } else {
        // Split the incoming data on the `:newline:` token
        const parts = event.data.split(':newline:');
        setStreamingText((prevText) => [...prevText, ...parts]);
      }
    };

    eventSource.onerror = function (error) {
      console.error("Error analyzing files:", error);
      setError("Failed to analyze the files. Please try again.");
      setLoading(false);
      eventSource.close();
    };

    eventSource.onopen = function () {
      console.log("Connection to server opened.");
    };

    eventSource.addEventListener("end", function () {
      setLoading(false);
      eventSource.close();
    });
  };

  const isBothFilesUploaded = docxFile && xlsxFile;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Upload and View Contract(DOCX)/Tasks(XLSX) Files</h1>

        {isBothFilesUploaded && (
          <>
            <button onClick={handleAnalysis}>Start Analysis</button>
          </>
        )}

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

        {streamingText.length > 0 && (
          <div className="streaming-output">
            <h2>Streaming Analysis Output:</h2>
            {streamingText.map((text, index) => (
              <React.Fragment key={index}>
                <span style={{ backgroundColor: text.includes('ambiguous') ? '#FF8C00' : 'transparent' }}>
                  {text}
                </span>
                {index < streamingText.length - 1 && <br />} {/* Add a line break for every :newline: */}
              </React.Fragment>
            ))}
          </div>
        )}

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
