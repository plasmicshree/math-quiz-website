"""
Grade 5 Math Quiz Logic
- Addition: 2-3 digits
- Subtraction: 2-3 digits
- Multiplication: 1-2 digits
- Division: 1-2 digits with remainders
- Fractions: Same denominator (2-8)
"""

import random

def generate_addition_question():
    """Generate addition question for Grade 5"""
    a = random.randint(1000, 100000)
    b = random.randint(1000, 100000)
    return {
        'question': f"What is {a} + {b}?",
        'answer': a + b
    }

def generate_subtraction_question():
    """Generate subtraction question for Grade 5"""
    a = random.randint(10, 999)
    b = random.randint(10, a)
    return {
        'question': f"What is {a} - {b}?",
        'answer': a - b
    }

def generate_multiplication_question():
    """Generate multiplication question for Grade 5"""
    a = random.randint(1, 99)
    b = random.randint(1, 99)
    return {
        'question': f"What is {a} × {b}?",
        'answer': a * b
    }

def generate_division_question():
    """Generate division question for Grade 5"""
    divisor = random.randint(2, 12)
    quotient = random.randint(2, 50)
    remainder = random.randint(0, divisor - 1)
    dividend = quotient * divisor + remainder
    return {
        'question': f"What is {dividend} ÷ {divisor}?",
        'answer': {'quotient': quotient, 'remainder': remainder}
    }

def generate_fraction_question():
    """Generate fraction addition question for Grade 5 (same denominator)"""
    denominator = random.randint(2, 8)
    num1 = random.randint(1, denominator - 1)
    num2 = random.randint(1, denominator - num1)
    
    result = round((num1 + num2) / denominator, 2)
    
    return {
        'question': f"What is {num1}/{denominator} + {num2}/{denominator}? (Answer in decimal, rounded to 2 places)",
        'answer': result,
        'fraction': f"{num1 + num2}/{denominator}",
        'fraction_visual': {
            'numerator1': num1,
            'numerator2': num2,
            'denominator': denominator,
            'same_denominator': True
        }
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question,
    'subtraction': generate_subtraction_question,
    'multiplication': generate_multiplication_question,
    'division': generate_division_question,
    'fractions': generate_fraction_question
}
