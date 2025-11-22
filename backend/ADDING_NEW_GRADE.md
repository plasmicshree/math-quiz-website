# Quick Reference: Adding a New Grade

This guide shows you how to add a new grade level to the Math Quiz system.

## Step 1: Create Grade Module

Create a new file: `backend/grades/grade_X.py` (replace X with grade number)

```python
"""
Grade X Math Quiz Logic
- Addition: [specify range]
- Subtraction: [specify range]
- Multiplication: [specify range]
- Division: [specify range]
- Fractions: [specify rules]
"""

import random

def generate_addition_question():
    """Generate addition question for Grade X"""
    a = random.randint(MIN, MAX)  # Set your ranges
    b = random.randint(MIN, MAX)
    return {
        'question': f"What is {a} + {b}?",
        'answer': a + b
    }

def generate_subtraction_question():
    """Generate subtraction question for Grade X"""
    a = random.randint(MIN, MAX)
    b = random.randint(MIN, a)  # Ensure no negatives if needed
    return {
        'question': f"What is {a} - {b}?",
        'answer': a - b
    }

def generate_multiplication_question():
    """Generate multiplication question for Grade X"""
    a = random.randint(MIN, MAX)
    b = random.randint(MIN, MAX)
    return {
        'question': f"What is {a} × {b}?",
        'answer': a * b
    }

def generate_division_question():
    """Generate division question for Grade X"""
    divisor = random.randint(MIN, MAX)
    quotient = random.randint(MIN, MAX)
    remainder = random.randint(0, divisor - 1)
    dividend = quotient * divisor + remainder
    return {
        'question': f"What is {dividend} ÷ {divisor}?",
        'answer': {'quotient': quotient, 'remainder': remainder}
    }

def generate_fraction_question():
    """Generate fraction question for Grade X"""
    # Implement based on grade requirements
    denom = random.randint(2, 9)
    num = random.randint(1, denom - 1)
    # ... add your logic
    return {
        'question': f"What is {num}/{denom} + ...?",
        'answer': result,
        'fraction': f"{num}/{denom} + ..."
    }

# Export all generators
QUESTION_GENERATORS = {
    'addition': generate_addition_question,
    'subtraction': generate_subtraction_question,
    'multiplication': generate_multiplication_question,
    'division': generate_division_question,
    'fractions': generate_fraction_question
}
```

## Step 2: Update app.py Imports

In `backend/app.py`, add your new grade to the imports:

```python
from grades import grade_5, grade_6, grade_X
```

## Step 3: Update generate_question() Function

In `backend/app.py`, add a condition for your new grade:

```python
def generate_question(section, grade=6):
    # Existing grades...
    if grade == 5 and section in grade_5.QUESTION_GENERATORS:
        result = grade_5.QUESTION_GENERATORS[section]()
        result["id"] = str(uuid.uuid4())
        result["section"] = section
        return result
    elif grade == 6 and section in grade_6.QUESTION_GENERATORS:
        result = grade_6.QUESTION_GENERATORS[section]()
        result["id"] = str(uuid.uuid4())
        result["section"] = section
        return result
    # ADD YOUR NEW GRADE HERE:
    elif grade == X and section in grade_X.QUESTION_GENERATORS:
        result = grade_X.QUESTION_GENERATORS[section]()
        result["id"] = str(uuid.uuid4())
        result["section"] = section
        return result
    
    # Rest of the legacy logic...
```

## Step 4: Test Your Module

Create a test function in `test_grades.py`:

```python
print("\n" + "=" * 50)
print("Testing Grade X modules...")
print("=" * 50)

# Test all operations
for operation in ['addition', 'subtraction', 'multiplication', 'division', 'fractions']:
    print(f"\nGrade X {operation.capitalize()}:")
    result = grade_X.QUESTION_GENERATORS[operation]()
    print(f"Question: {result['question']}")
    print(f"Answer: {result['answer']}")
```

Run the tests:
```bash
cd backend
poetry run python test_grades.py
```

## Step 5: Update Frontend (Optional)

If you want to add Grade X to the frontend grade selector:

In `frontend/app.js`, find the grade selector and add your grade:

```javascript
<select id="grade-select">
    <option value="1">Grade 1</option>
    <option value="2">Grade 2</option>
    <!-- ... -->
    <option value="6">Grade 6</option>
    <option value="X">Grade X</option>  <!-- ADD THIS -->
</select>
```

## Grade Specifications Reference

### Grade 5
- Addition: 2-3 digits (10-999)
- Subtraction: 2-3 digits (10-999)
- Multiplication: 1-2 digits (1-99)
- Division: 1-2 digits with remainder
- Fractions: Same denominator (2-8)

### Grade 6
- Addition: 3-4 digits (100-9999)
- Subtraction: 3-4 digits (100-9999)
- Multiplication: 2-3 digits (10-999)
- Division: 2-3 digits with remainder
- Fractions: Different denominators (2-9)

## Common Patterns

### Ensuring No Negative Results (Subtraction)
```python
a = random.randint(MIN, MAX)
b = random.randint(MIN, a)  # b will always be ≤ a
```

### Division with Remainder
```python
divisor = random.randint(2, 10)
quotient = random.randint(1, 100)
remainder = random.randint(0, divisor - 1)
dividend = quotient * divisor + remainder
```

### Fraction Addition (Same Denominator)
```python
denom = random.randint(2, 8)
num1 = random.randint(1, denom - 1)
num2 = random.randint(1, denom - 1)
result = round((num1 + num2) / denom, 2)
```

### Fraction Addition (Different Denominators)
```python
denom1 = random.randint(2, 9)
denom2 = random.randint(2, 9)
while denom2 == denom1:
    denom2 = random.randint(2, 9)
num1 = random.randint(1, denom1 - 1)
num2 = random.randint(1, denom2 - 1)
result = round((num1/denom1) + (num2/denom2), 2)
```

## Return Format Standards

### Basic Operations
```python
{
    'question': "What is 123 + 456?",
    'answer': 579
}
```

### Division
```python
{
    'question': "What is 100 ÷ 7?",
    'answer': {
        'quotient': 14,
        'remainder': 2
    }
}
```

### Fractions
```python
{
    'question': "What is 1/2 + 1/3? (Round to 2 decimal places)",
    'answer': 0.83,
    'fraction': "1/2 + 1/3"
}
```

## Troubleshooting

### Import Error
```
ModuleNotFoundError: No module named 'grades.grade_X'
```
**Solution:** Make sure you created `grades/grade_X.py` and it has no syntax errors.

### Function Not Called
**Solution:** Check that you added the elif condition in `generate_question()` in `app.py`.

### Wrong Number Ranges
**Solution:** Review your `random.randint(MIN, MAX)` calls and adjust the ranges.

## Testing Checklist

- [ ] Module imports without errors
- [ ] Addition generates correct questions and answers
- [ ] Subtraction generates correct questions and answers
- [ ] Multiplication generates correct questions and answers
- [ ] Division generates correct questions and answers (with quotient/remainder)
- [ ] Fractions generate correct questions and answers
- [ ] Number ranges match grade specifications
- [ ] API endpoint works: `GET /api/question?section=addition&grade=X`
- [ ] Answers validate correctly via `POST /api/answer`

---

**Pro Tip:** Copy `grades/grade_5.py` or `grades/grade_6.py` as a starting point and modify the number ranges!
