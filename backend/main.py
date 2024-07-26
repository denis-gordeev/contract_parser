import json

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from functools import lru_cache
from docx import Document
from io import BytesIO
import os

from langchain_community.document_loaders import JSONLoader
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.output_parsers.json import SimpleJsonOutputParser
import pandas as pd
import time

cache = dict()
if os.path.exists('cache.json'):
    with open('cache.json') as f:
        cache = json.load(f)

openai_key = os.getenv("OPENAI_API_KEY")

embedding_function = SentenceTransformerEmbeddings(model_name="infgrad/stella-base-en-v2")

docx_data = dict()
xlsx_data = {'data': None}


@lru_cache()
def get_document_structure(text):
    if text in cache:
        return cache[text]
    model = ChatOpenAI(
        model="gpt-4o",
        openai_api_key=openai_key,
        model_kwargs={ "response_format": { "type": "json_object" } },
    )

    prompt = ChatPromptTemplate.from_template(
        "Could you reorganize this document into a structured json-file. "
        "For each document part could you add a key 'keywords' which would contain "
        "all insightful keywords, contract conditions, terms and sums of money."
        "Could you also add the original text for each document part in the 'text' key."
        'You must always output a JSON object with a "content" key'
        "{document}"
    )

    chain = prompt | model | SimpleJsonOutputParser()

    document_content = chain.invoke({ "document": text })
    cache[text] = document_content
    with open('cache.json', 'w') as f:
        json.dump(cache, f)
    return document_content


@lru_cache()
def get_keywords(text):
    model = ChatOpenAI(
        model="gpt-4o",
        openai_api_key=openai_key,
        model_kwargs={ "response_format": { "type": "json_object" } },
    )

    prompt = ChatPromptTemplate.from_template(
        "Could you select all insightful terms, keywords and money sums out of this text"
        'You must always output a JSON object with a "keywords" key'
        "{text}"
    )

    chain = prompt | model | SimpleJsonOutputParser()

    document_content = chain.invoke({ "text": text })
    return document_content


def load_documents():
    loader = JSONLoader(file_path="./document.json", jq_schema=".content[]", text_content=False)
    documents = loader.load()

    db = Chroma.from_documents(documents, embedding_function)
    return db


def run_query(db, query):
    docs = db.similarity_search(query)
    doc_pages = [json.loads(doc.page_content) for doc in docs]
    print('query', query)
    print(doc_pages)
    texts = [doc.get('text', "") for doc in doc_pages]
    for page in doc_pages:
        for k, v in page.items():
            if type(v) is dict:
                texts.append(v.get('text'))
            elif type(v) is list:
                for subsection in v:
                    if type(subsection) is dict:
                        texts.append(subsection.get('text'))
    texts = [t for t in texts if t]
    return texts


def analyze(row, conditions):
    model = ChatOpenAI(
        model="gpt-4o",
        openai_api_key=openai_key,
        # model_kwargs={ "response_format": { "type": "json_object" } },
        stream_usage=True
    )

    prompt = ChatPromptTemplate.from_template(
        "You are provided with a contract text containing various terms and constraints for work execution "
        "(e.g., budget constraints, types of allowable work, etc.)"
        "You are also given a task that needs to be performed according to the contract. "
        "The task description is accompanied by a cost estimate."
        "Your task is to analyze the task description for compliance with the contract conditions. "
        "If the task description violates one or more conditions, you should specify the reason for the violation."
        "Do not add any other information besides the violations. "
        "Do not add conditions that are met."
        "If it is unclear from the description of the completed work whether it may contradict the contract terms, "
        "then add `ambiguous` to the beginning of response and tell why you are not sure."
        "Task: {task}"
        "Conditions: {conditions}"
    )

    chain = prompt | model
    stream = chain.stream({ "conditions": conditions, "task": row})
    for chunk in stream:
        yield chunk
    # return document_content


app = FastAPI(debug=True)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload-docx/")
async def upload_docx(file: UploadFile = File(...)):
    if file.content_type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        raise HTTPException(status_code=400, detail="Invalid file type. Only DOCX files are allowed.")

    try:
        contents = await file.read()
        doc = Document(BytesIO(contents))
        text = []

        for paragraph in doc.paragraphs:
            text.append(paragraph.text)
        print('processed docx')
        print(text)
        content = get_document_structure("\n".join(text))
        with open("document.json", "w") as f:
            json.dump(content, f)
        print(content)
        docx_data['content'] = content['content']
        return JSONResponse(content)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-xlsx/")
async def upload_csv(file: UploadFile = File(...)):
    if file.content_type not in ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only XLSX files are allowed.")
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents), engine='openpyxl')
        data = df.to_dict(orient='records')
        xlsx_data['data'] = df
        return JSONResponse(content={"data": data})
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/analyze/')
async def stream_xlsx_processing():
    async def event_generator():
        db = load_documents()
        df = xlsx_data['data']
        for index, row in df.iterrows():
            texts = []
            data_dict = row.to_dict()
            yield f"data: {json.dumps(data_dict)}\n\n"
            if str(texts) + str(row) in cache:
                cached_result =  cache[str(texts) + str(row)]
                yield cached_result
                continue
            for k, v in row.items():
                texts += run_query(db, v)
            texts = sorted(set(texts))
            analysis = ""
            for chunk in analyze(row, conditions=texts):
                chunk_text = chunk.content
                analysis += chunk_text
            print(analysis)
            yield f"data: {analysis}\n\n"
            cache[str(texts) + str(row)] = analysis
            with open('cache.json', 'w') as f:
                json.dump(cache, f)
            yield "data: :newline: \n\n"
        yield "data: [END]\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, workers=1)
