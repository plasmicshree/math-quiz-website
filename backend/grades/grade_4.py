"""
Grade 4 Math Quiz Logic
- Addition: Numbers 1-99
- Subtraction: Numbers 1-99, no negatives
- Multiplication: Tables 11-20
- Division: Divisor 2-5, dividend ≤ 50, whole numbers only
"""

import random

def generate_addition_question():
    """Generate addition question for Grade 4"""
    a = random.randint(1, 99)
    b = random.randint(1, 99)
    return {
        'question': f"What is {a} + {b}?",
        'answer': a + b
    }

def generate_subtraction_question():
    """Generate subtraction question for Grade 4"""
    a = random.randint(1, 99)
    b = random.randint(1, a)  # Ensure a >= b (no negatives)
    return {
        'question': f"What is {a} - {b}?",
        'answer': a - b
    }

def generate_multiplication_question():
    """Generate multiplication question for Grade 4"""
    a = random.randint(11, 20)
    b = random.randint(11, 20)
    return {
        'question': f"What is {a} × {b}?",
        'answer': a * b
    }

def generate_division_question():
    """Generate division question for Grade 4 (whole numbers only)"""
    divisor = random.randint(2, 5)
    quotient = random.randint(1, 50 // divisor)  # Ensure whole number division
    dividend = divisor * quotient
    return {
        'question': f"What is {dividend} ÷ {divisor}? Enter quotient and remainder.",
        'answer': {'quotient': quotient, 'remainder': 0}
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question,
    'subtraction': generate_subtraction_question,
    'multiplication': generate_multiplication_question,
    'division': generate_division_question
}
