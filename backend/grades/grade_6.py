"""
Grade 6 Math Quiz Logic
- Addition: 3-4 digits
- Subtraction: 3-4 digits
- Multiplication: 2-3 digits
- Division: 2-3 digits with remainders
- Fractions: Different denominators (2-9)
"""

import random

def generate_addition_question():
    """Generate addition question for Grade 6"""
    a = random.randint(100, 9999)
    b = random.randint(100, 9999)
    return {
        'question': f"What is {a} + {b}?",
        'answer': a + b
    }

def generate_subtraction_question():
    """Generate subtraction question for Grade 6"""
    a = random.randint(100, 9999)
    b = random.randint(100, a)
    return {
        'question': f"What is {a} - {b}?",
        'answer': a - b
    }

def generate_multiplication_question():
    """Generate multiplication question for Grade 6"""
    a = random.randint(10, 999)
    b = random.randint(10, 999)
    return {
        'question': f"What is {a} × {b}?",
        'answer': a * b
    }

def generate_division_question():
    """Generate division question for Grade 6"""
    divisor = random.randint(10, 99)
    quotient = random.randint(10, 99)
    remainder = random.randint(0, divisor - 1)
    dividend = quotient * divisor + remainder
    return {
        'question': f"What is {dividend} ÷ {divisor}?",
        'answer': {'quotient': quotient, 'remainder': remainder}
    }

def generate_fraction_question():
    """Generate fraction addition question for Grade 6 (different denominators)"""
    denom1 = random.randint(2, 9)
    denom2 = random.randint(2, 9)
    while denom2 == denom1:
        denom2 = random.randint(2, 9)
    
    num1 = random.randint(1, denom1 - 1)
    num2 = random.randint(1, denom2 - 1)
    
    result = round((num1 / denom1) + (num2 / denom2), 2)
    
    return {
        'question': f"What is {num1}/{denom1} + {num2}/{denom2}? (Answer in decimal, rounded to 2 places)",
        'answer': result,
        'fraction': f"{num1}/{denom1} + {num2}/{denom2}",
        'fraction_visual': {
            'numerator1': num1,
            'denominator1': denom1,
            'numerator2': num2,
            'denominator2': denom2,
            'same_denominator': False
        }
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question,
    'subtraction': generate_subtraction_question,
    'multiplication': generate_multiplication_question,
    'division': generate_division_question,
    'fractions': generate_fraction_question
}
