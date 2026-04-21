"""
LangGraph analysis workflow.

NOTE: The main document processing pipeline in processing.py now calls
LLM functions directly (topics first, then the rest concurrently) for
faster time-to-first-result.  This module is kept as a utility if you
ever want to run the full sequential analysis as a single invocation.
"""

from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from app.services.llm import extract_topics, generate_explanations, generate_mind_tree, generate_predicted_questions

class AnalysisState(TypedDict):
    text: str
    topics: List[str]
    explanations: Dict[str, str]
    mind_tree: Dict[str, Any]
    questions: List[Dict[str, str]]

async def extract_topics_node(state: AnalysisState):
    topics = await extract_topics(state["text"])
    return {"topics": topics}

async def generate_explanations_node(state: AnalysisState):
    explanations = await generate_explanations(state["text"], state["topics"])
    return {"explanations": explanations}

async def generate_mind_tree_node(state: AnalysisState):
    mind_tree = await generate_mind_tree(state["text"])
    return {"mind_tree": mind_tree}

async def generate_questions_node(state: AnalysisState):
    questions = await generate_predicted_questions(state["text"])
    return {"questions": questions}

# Build Graph
workflow = StateGraph(AnalysisState)

workflow.add_node("extract_topics", extract_topics_node)
workflow.add_node("generate_explanations", generate_explanations_node)
workflow.add_node("generate_mind_tree", generate_mind_tree_node)
workflow.add_node("generate_questions", generate_questions_node)

workflow.set_entry_point("extract_topics")
workflow.add_edge("extract_topics", "generate_explanations")
workflow.add_edge("generate_explanations", "generate_mind_tree")
workflow.add_edge("generate_mind_tree", "generate_questions")
workflow.add_edge("generate_questions", END)

app = workflow.compile()

async def run_analysis(text: str):
    """Run the full sequential analysis pipeline (topics → explanations → mind tree → questions)."""
    initial_state = AnalysisState(
        text=text, 
        topics=[], 
        explanations={}, 
        mind_tree={}, 
        questions=[]
    )
    result = await app.ainvoke(initial_state)
    return result
