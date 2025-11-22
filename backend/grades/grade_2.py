"""
Grade 2 Math Quiz Logic
- Addition: Numbers 1-20, sum ≤ 30
- Subtraction: Numbers 1-20, no negatives
"""

import random

def generate_addition_question():
    """Generate addition question for Grade 2"""
    a = random.randint(1, 20)
    b = random.randint(1, min(20, 30 - a))  # Ensure sum <= 30
    return {
        'question': f"What is {a} + {b}?",
        'answer': a + b
    }

def generate_subtraction_question():
    """Generate subtraction question for Grade 2"""
    a = random.randint(1, 20)
    b = random.randint(1, a)  # Ensure a >= b (no negatives)
    return {
        'question': f"What is {a} - {b}?",
        'answer': a - b
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question,
    'subtraction': generate_subtraction_question
}
