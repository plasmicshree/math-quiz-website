"""
Grade 3 Math Quiz Logic
- Addition: Numbers 1-50
- Subtraction: Numbers 1-99, no negatives
- Multiplication: Tables 2-10
"""

import random

def generate_addition_question():
    """Generate addition question for Grade 3"""
    a = random.randint(10, 100)
    b = random.randint(10, 100)
    return {
        'question': f"What is {a} + {b}?",
        'answer': a + b
    }

def generate_subtraction_question():
    """Generate subtraction question for Grade 3"""
    a = random.randint(1, 99)
    b = random.randint(1, a)  # Ensure a >= b (no negatives)
    return {
        'question': f"What is {a} - {b}?",
        'answer': a - b
    }

def generate_multiplication_question():
    """Generate multiplication question for Grade 3"""
    a = random.randint(2, 10)
    b = random.randint(2, 10)
    return {
        'question': f"What is {a} × {b}?",
        'answer': a * b
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question,
    'subtraction': generate_subtraction_question,
    'multiplication': generate_multiplication_question
}
