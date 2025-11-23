"""
Grade 1 Math Quiz Logic
- Addition: Single digit (1-9), sum ≤ 20
  - 70% probability: sum < 10 (easier problems)
  - 30% probability: sum 10-20 (harder problems)
  - Block visualization: 5 sections per block
"""

import random
from .block_utils import create_blocks

def generate_addition_question():
    """Generate addition question for Grade 1"""
    # 70% chance of easier problems (sum < 10)
    if random.random() < 0.7:
        # Easy: sum < 10
        a = random.randint(1, 9)
        b = random.randint(1, min(9, 9 - a))  # Ensure sum < 10
    else:
        # Harder: sum 10-20
        a = random.randint(1, 9)
        b = random.randint(max(1, 10 - a), 9)  # Ensure 10 <= sum <= 20
    
    total = a + b
    
    # Create visual blocks representation (5 sections per block for Grade 1)
    return {
        'question': f"What is {a} + {b}?",
        'answer': total,
        'first_number': a,
        'second_number': b,
        'visual': {
            'first': create_blocks(a, sections_per_block=5),
            'second': create_blocks(b, sections_per_block=5),
            'result': create_blocks(total, sections_per_block=5)
        }
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question
}

