"""
Grade 1 Math Quiz Logic
- Addition: Single digit (1-9), sum ≤ 20
  - 70% probability: sum < 10 (easier problems)
  - 30% probability: sum 10-20 (harder problems)
"""

import random

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
    
    # Create visual blocks representation
    # Each block has max 5 sections
    def create_blocks(num):
        """Create block representation for a number"""
        full_blocks = num // 5
        remainder = num % 5
        return {
            'full_blocks': full_blocks,
            'remainder': remainder,
            'total': num
        }
    
    return {
        'question': f"What is {a} + {b}?",
        'answer': total,
        'first_number': a,
        'second_number': b,
        'visual': {
            'first': create_blocks(a),
            'second': create_blocks(b),
            'result': create_blocks(total)
        }
    }

QUESTION_GENERATORS = {
    'addition': generate_addition_question
}

