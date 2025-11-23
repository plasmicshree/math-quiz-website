"""
Grade 2 Math Quiz Logic
- Addition: Numbers 1-20, sum ≤ 30
  - Block visualization: 10 sections per block
- Subtraction: Numbers 1-20, no negatives
"""

import random
from .block_utils import create_blocks

def generate_addition_question():
    """Generate addition question for Grade 2"""
    a = random.randint(1, 20)
    b = random.randint(1, min(20, 30 - a))  # Ensure sum <= 30
    total = a + b
    
    return {
        'question': f"What is {a} + {b}?",
        'answer': total,
        'first_number': a,
        'second_number': b,
        'visual': {
            'first': create_blocks(a, sections_per_block=10),
            'second': create_blocks(b, sections_per_block=10),
            'result': create_blocks(total, sections_per_block=10)
        }
    }

def generate_subtraction_question():
    """Generate subtraction question for Grade 2"""
    a = random.randint(1, 20)
    b = random.randint(1, a)  # Ensure a >= b (no negatives)
    result = a - b
    
    return {
        'question': f"What is {a} - {b}?",
        'answer': result,
        'minuend': a,  # The number we start with
        'subtrahend': b,  # The number we subtract
        'visual': {
            'total': create_blocks(a, sections_per_block=10),  # Starting amount
            'subtract': create_blocks(b, sections_per_block=10),  # Amount to remove
            'result': create_blocks(result, sections_per_block=10)  # Remaining
        }
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question,
    'subtraction': generate_subtraction_question
}
