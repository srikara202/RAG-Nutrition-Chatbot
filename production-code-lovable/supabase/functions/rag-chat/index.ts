import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatRequest {
  message: string;
}

interface ChunkResult {
  id: number;
  doc_id: string;
  chunk_index: number;
  content: string;
  metadata: {
    page?: number;
    source?: string;
  };
  similarity: number;
}

async function embedQuery(query: string, openaiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Embeddings API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function getChatCompletion(
  message: string,
  context: string,
  openaiKey: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a friendly and knowledgeable nutrition assistant for an educational RAG chatbot. 
Answer ONLY using the provided CONTEXT from the nutrition textbook.
Be conversational but accurate. Use simple language when possible.
ALWAYS cite your sources using [1], [2], etc. format matching the context numbers.
Include page numbers in your citations (e.g., "as mentioned on page X [1]").
If the context doesn't contain relevant information, politely say so and suggest what topics you can help with.
Format your response with markdown for better readability - use bullet points, bold for key terms, etc.`,
        },
        {
          role: "user",
          content: `QUESTION: ${message}\n\nCONTEXT:\n${context}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Chat API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body: ChatRequest = await req.json();
    const message = (body?.message ?? "").toString().trim();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Empty query" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing query: "${message}"`);

    // 1) Embed the query
    const queryEmbedding = await embedQuery(message, openaiKey);
    console.log("Query embedded successfully");

    // 2) Retrieve from Supabase
    const { data: chunks, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_count: 8,
      filter: { source: "human-nutrition-text.pdf" },
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      throw error;
    }

    console.log(`Retrieved ${(chunks ?? []).length} chunks`);

    // 3) Build the context
    const typedChunks = (chunks ?? []) as ChunkResult[];
    const context = typedChunks
      .map((c, i) => `[${i + 1}] (Page ${c.metadata?.page ?? "?"}) ${c.content}`)
      .join("\n\n");

    // If nothing relevant was found
    if (!context) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find relevant information about that in the nutrition textbook. Try asking about topics like vitamins, minerals, digestion, proteins, or dietary guidelines!",
          sources: [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4) Get chat completion
    const answer = await getChatCompletion(message, context, openaiKey);
    console.log("Chat completion generated");

    return new Response(
      JSON.stringify({
        answer,
        sources: typedChunks.map((c, i) => ({
          id: c.id,
          index: i + 1,
          page: c.metadata?.page ?? null,
          content: c.content,
          similarity: c.similarity,
          doc_id: c.doc_id,
          chunk_index: c.chunk_index,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("rag-chat error:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});