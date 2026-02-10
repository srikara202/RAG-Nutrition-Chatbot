# Bio‑Scribe Assist: RAG Chatbot for a Nutrition Textbook

A **Retrieval‑Augmented Generation (RAG)** project built (mostly) from scratch in a Google Colab notebook: **no LangChain, no ChromaDB**.

The core idea is simple:

* Turn a PDF into clean text
* Split the text into small chunks
* Embed chunks + user queries into the same vector space
* Retrieve the most relevant chunks
* Feed those chunks to an LLM so the answer stays grounded in the PDF

✅ Live demo: **[https://bio-scribe-assist.lovable.app/](https://bio-scribe-assist.lovable.app/)**

✅ Notebook: LLM_RAG_Nutrition_Pipeline.ipynb (upload and run on google scholar)

---

## What this project does

### Notebook RAG workflow (from scratch)

1. **Extract text from PDF** page‑by‑page (PyMuPDF)
2. **Chunk** the text (I tested multiple chunking strategies)
3. **Embed** each chunk using a pretrained embedding model
4. When a user asks a question:

   * **Embed the query**
   * **Retrieve top‑k chunks** closest to the query (similarity search)
5. **Build a RAG prompt** by augmenting the query with retrieved chunks + strict instructions
6. **Generate an answer** using an LLM (Gemma 2 in the notebook)

### Production version

To make it production‑ready, I moved retrieval to a hosted vector DB and added a deployed UI:

1. **Supabase (Postgres + vector extension)** stores chunk text + embeddings and retrieves top‑k chunks by similarity.
2. A script ingests chunked + embedded data into Supabase.
3. **Lovable.dev** was used to build and deploy the chatbot UI.

### AI-assisted code disclosure

**What I built vs what AI drafted**

**I designed & implemented:** the end-to-end RAG workflow in Colab (PDF extraction → chunking → embeddings → retrieval → RAG prompting → generation), chunking experiments, embedding/retrieval logic, and prompt grounding rules.

**AI-drafted (then reviewed/edited by me):** Supabase SQL for vector table + similarity search query, a script for chunk/embedding ingestion into Supabase, and the initial UI/deployment scaffold via Lovable.dev.

## Dataset / document

The notebook downloads a public PDF on Human Nutrition:

* URL (downloaded inside the notebook): `https://pressbooks.oer.hawaii.edu/humannutrition2/open/download?type=pdf`

---

## Tech stack

### Notebook (Colab)

* **PyMuPDF (pymupdf)**: PDF text extraction + page rendering
* **spaCy**: sentence splitting for structural chunking
* **NLTK / sklearn**: used while exploring alternative chunking strategies
* **SentenceTransformers**: embeddings (`all-mpnet-base-v2`)
* **PyTorch**: storing embeddings + top‑k retrieval
* **Transformers + bitsandbytes + accelerate**: Gemma 2 inference (optionally 4‑bit)

### Production

* **Supabase** (Postgres + vector database table)
* **Lovable.dev** (frontend + deployment)
* **GPT‑3** (generation LLM in the deployed app)

---

## Chunking strategies explored

I tested 5 strategies in the notebook:

* **Fixed chunking** (character‑based)
* **Semantic chunking** (sentence embedding similarity)
* **Recursive chunking** (split by structure → fallback to sentences)
* **Structural chunking** (sentence‑based groups)
* **LLM‑based chunking** (prototype / optional)

**Final choice:** small, consistent chunks.

* In the notebook’s main pipeline, chunks are created by grouping **~10 sentences per chunk** (spaCy sentencizer), then filtering out very small chunks (e.g., `< ~30 tokens`).
* I also experimented with fixed‑size chunking because consistent chunk sizes are helpful for predictable retrieval and prompt construction.

---

## Retrieval method

* Chunks and the query are embedded using the **same embedding model**.
* Similarity search uses **top‑k retrieval** over all embeddings.
* In the notebook, this is implemented via **dot product scores** (SentenceTransformers `util.dot_score`) + `torch.topk`.

  * If embeddings are normalized, dot product ≈ cosine similarity.

---

## Prompting (grounded answers)

The RAG prompt is intentionally strict:

* The model is told to use **only** the provided context chunks
* If context is insufficient, it must say so
* Output format is enforced (e.g., starts with `Answer:`)

This helps reduce hallucinations and keeps answers tied to the PDF.

---

## How to run (Notebook)

1. Open `LLM_RAG_Nutrition_Pipeline.ipynb` in **Google Colab**.
2. Run the dependency install cells.
3. Run the PDF download + text extraction cells.
4. Run the chunking + embedding pipeline.
5. Use the helper function:

```python
answer = ask("What are the functions of macronutrients?")
print(answer)
```

### Hardware notes

* Embedding can run on CPU, but GPU helps.
* Gemma inference needs a GPU; the notebook includes logic to choose **Gemma 2B / 7B** and optionally enable **4‑bit quantization** depending on available VRAM.

---

## Production setup (Supabase)

High level:

1. Create a Supabase project.
2. Create a table for chunks + embeddings.
3. Ingest all chunks + vectors.
4. Query Supabase for top‑k similar chunks at runtime.

---

## Deployed chatbot

* Built and deployed using **Lovable.dev**
* Retrieval: **Supabase vector table**
* Generation: **GPT‑3**
* URL: **[https://bio-scribe-assist.lovable.app/](https://bio-scribe-assist.lovable.app/)**

---

## Design choices (why this approach)

* **No LangChain/ChromaDB**: I wanted to understand and implement the core RAG mechanics directly.
* **Consistent chunk sizes**: makes retrieval behavior and prompt construction more stable.
* **Simple similarity search**: dot‑product / cosine‑style retrieval is fast and works well for a single‑document RAG.
* **Strict prompting**: reduces hallucinations and forces grounded answers.

---

## Limitations

* Retrieval is purely embedding‑based (no keyword/hybrid search).
* No reranker (e.g., cross‑encoder): top‑k may include a few “almost relevant” chunks.
* Prompt injection is not fully hardened (a malicious chunk/query could attempt to override instructions).
* Evaluation is mostly qualitative (manual spot checks).

---

## Future improvements

* Add **hybrid retrieval** (BM25 + vectors)
* Add a **reranker** for higher precision
* Add **citation formatting** (page numbers + chunk IDs)
* Add automated **RAG evaluation** (faithfulness / groundedness metrics)
* Add caching + streaming responses for faster UX

---

## Acknowledgements

* SentenceTransformers + Hugging Face Transformers ecosystems
* Supabase for hosted Postgres + vector search
* Lovable.dev for rapid UI + deployment

---

## Contact

If you’d like to discuss the implementation details or extensions (multi‑doc RAG, reranking, eval, etc.), feel free to reach out.
