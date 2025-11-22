"""
Grade 1 Math Quiz Logic
- Addition: Single digit (1-9), sum ≤ 10
"""

import random

def generate_addition_question():
    """Generate addition question for Grade 1"""
    a = random.randint(1, 9)
    b = random.randint(1, 10 - a)  # Ensure sum <= 10
    return {
        'question': f"What is {a} + {b}?",
        'answer': a + b
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question
}
