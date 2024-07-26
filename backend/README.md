# FastAPI Document and Task Analysis Service

This FastAPI application provides endpoints to upload and process DOCX and XLSX files, extract structured data, and analyze task descriptions for compliance with contract conditions.

## Features

- **Upload DOCX Files**: Extracts and structures the content into JSON.
- **Upload XLSX Files**: Reads the content into a Pandas DataFrame.
- **Analyze Tasks**: Evaluates task descriptions against contract conditions and streams the analysis results.

## Setup and Installation

### Prerequisites

- Python 3.7 or later
- FastAPI
- Uvicorn
- Pandas
- OpenAI API key
- Additional dependencies: `langchain`, `docx`, `openpyxl`

### Installation

1. Clone the repository:

```bash
git clone <repository_url>
cd <repository_directory>
```

2. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate
```

3. Install the required packages:

```bash
pip install fastapi uvicorn pandas python-docx openpyxl langchain
```

4. Set the OpenAI API key in your environment:

```bash
export OPENAI_API_KEY=<your_openai_api_key>
```

## Running the Application

Start the FastAPI application using Uvicorn:

```bash
uvicorn main:app --reload
```

The application will be available at `http://127.0.0.1:8001`.

## Endpoints

### Upload DOCX File

- **URL**: `/upload-docx/`
- **Method**: `POST`
- **Description**: Upload a DOCX file and extract its content into a structured JSON format.
- **Request Body**: A DOCX file.

#### Example

```bash
curl -X POST "http://127.0.0.1:8001/upload-docx/" -F "file=@<path_to_docx_file>"
```

### Upload XLSX File

- **URL**: `/upload-xlsx/`
- **Method**: `POST`
- **Description**: Upload an XLSX file and read its content into a Pandas DataFrame.
- **Request Body**: An XLSX file.

#### Example

```bash
curl -X POST "http://127.0.0.1:8001/upload-xlsx/" -F "file=@<path_to_xlsx_file>"
```

### Analyze Tasks

- **URL**: `/analyze/`
- **Method**: `GET`
- **Description**: Analyze task descriptions for compliance with contract conditions and stream the results.
- **Response**: A streaming response with analysis results.

#### Example

```bash
curl -N "http://127.0.0.1:8001/analyze/"
```

## Code Overview

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

## Contributing

Feel free to submit issues, fork the repository, and send pull requests.

## License

This project is licensed under the MIT License.

---

By following this README, you can set up and run the FastAPI application for document and task analysis. For further customization or enhancement, refer to the code and modify it as needed.
