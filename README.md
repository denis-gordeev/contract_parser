# Document and Task Analysis Service

This project consists of a FastAPI backend and a React frontend for uploading, processing, and analyzing DOCX and XLSX files. The service extracts structured data from DOCX files, reads content from XLSX files, and analyzes task descriptions for compliance with contract conditions.

## Features

- **Upload DOCX Files**: Extracts and structures the content into JSON.
- **Upload XLSX Files**: Reads the content into a Pandas DataFrame.
- **Streaming Analysis**: Analyzes task descriptions for compliance with contract conditions and streams the analysis results.
- **React Frontend**: Provides an interface for uploading files and viewing analysis results.

## Setup and Installation

### Prerequisites

- Python 3.7 or later
- Node.js (>= 12.x)
- npm or yarn
- FastAPI
- Uvicorn
- Pandas
- OpenAI API key
- Additional dependencies: `langchain`, `docx`, `openpyxl`

### Backend Installation

1. Clone the repository:

```bash
git clone <repository_url>
cd <repository_directory>/backend
```

2. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate
```

3. Install the required packages:

```bash
pip install -r requirements.txt
```

4. Set the OpenAI API key in your environment:

```bash
export OPENAI_API_KEY=<your_openai_api_key>
```

5. Start the FastAPI application using Uvicorn:

```bash
uvicorn main:app --reload
```

The backend will be available at `http://127.0.0.1:8001`.

### Frontend Installation

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install the required packages:

```bash
npm install
# or
yarn install
```

3. Start the React application:

```bash
npm start
# or
yarn start
```

The frontend will be available at `http://localhost:3000`.

## Usage

### Upload DOCX File

1. Click on the "Choose File" button under the DOCX section in the frontend.
2. Select a DOCX file from your local system.
3. Click the "Upload DOCX" button to upload and process the file.
4. The content of the DOCX file will be displayed in the DOCX File Content section.

### Upload XLSX File

1. Click on the "Choose File" button under the XLSX section in the frontend.
2. Select an XLSX file from your local system.
3. Click the "Upload XLSX" button to upload and process the file.
4. The content of the XLSX file will be displayed in the XLSX File Content section.

### Start Analysis

1. Ensure both DOCX and XLSX files are uploaded.
2. Click the "Start Analysis" button to begin the analysis process.
3. The streaming analysis output will be displayed in the Streaming Analysis Output section.
4. Lines containing the word "ambiguous" will be highlighted in dark orange.

## Backend Code Overview

### Import Statements

- Import necessary modules and packages.

### Global Variables

- `cache`: Stores cached results.
- `openai_key`: Retrieves the OpenAI API key from the environment.
- `embedding_function`: Sets up the SentenceTransformer embeddings.
- `docx_data` and `xlsx_data`: Stores the content of uploaded DOCX and XLSX files.

### Helper Functions

- `get_document_structure`: Extracts and structures the content of a DOCX file.
- `get_keywords`: Extracts keywords and insightful terms from text.
- `load_documents`: Loads and processes documents from a JSON file.
- `run_query`: Searches for similar documents in the database.
- `analyze`: Analyzes task descriptions for compliance with contract conditions.

### FastAPI Endpoints

- `/upload-docx/`: Handles DOCX file uploads and content extraction.
- `/upload-xlsx/`: Handles XLSX file uploads and content extraction.
- `/analyze/`: Streams task analysis results.

### Main Application

- Initializes the FastAPI app.
- Configures CORS middleware.
- Runs the application with Uvicorn.

## Frontend Code Overview

### State Management

- **docxFile**: Stores the selected DOCX file.
- **xlsxFile**: Stores the selected XLSX file.
- **docxContent**: Stores the content of the uploaded DOCX file.
- **xlsxContent**: Stores the content of the uploaded XLSX file.
- **error**: Stores error messages.
- **loading**: Indicates whether a file is being uploaded or analyzed.
- **isDOCXUploaded**: Indicates whether a DOCX file has been uploaded.
- **isXLSXUploaded**: Indicates whether an XLSX file has been uploaded.
- **streamingText**: Stores the streaming analysis output.

### Functions

- **handleDocxFileChange**: Handles DOCX file selection.
- **handleXlsxFileChange**: Handles XLSX file selection.
- **handleDocxSubmit**: Handles DOCX file upload and content extraction.
- **handleXlsxSubmit**: Handles XLSX file upload and content extraction.
- **handleAnalysis**: Handles the streaming analysis of task descriptions.

### JSX Structure

- **File Upload Forms**: Forms to upload DOCX and XLSX files.
- **Error and Loading Messages**: Displays error messages and loading indicators.
- **File Content Display**: Displays the content of uploaded DOCX and XLSX files.
- **Streaming Analysis Output**: Displays the streaming analysis output, highlighting lines containing "ambiguous" in dark orange.

## Contributing

Feel free to submit issues, fork the repository, and send pull requests.

## License

This project is licensed under the MIT License.

---

By following this README, you can set up and run the FastAPI backend and React frontend for document and task analysis. For further customization or enhancement, refer to the code and modify it as needed.
