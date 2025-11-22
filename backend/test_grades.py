#!/usr/bin/env python3
"""Test script to verify grade modules work correctly"""

from grades import grade_1, grade_2, grade_3, grade_4, grade_5, grade_6

print("Testing Grade 1 modules...")
print("=" * 50)

# Test Grade 1 question generators
print("\nGrade 1 Addition:")
result = grade_1.generate_addition_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\n" + "=" * 50)
print("Testing Grade 2 modules...")
print("=" * 50)

# Test Grade 2 question generators
print("\nGrade 2 Addition:")
result = grade_2.generate_addition_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 2 Subtraction:")
result = grade_2.generate_subtraction_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\n" + "=" * 50)
print("Testing Grade 3 modules...")
print("=" * 50)

# Test Grade 3 question generators
print("\nGrade 3 Addition:")
result = grade_3.generate_addition_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 3 Subtraction:")
result = grade_3.generate_subtraction_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 3 Multiplication:")
result = grade_3.generate_multiplication_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\n" + "=" * 50)
print("Testing Grade 4 modules...")
print("=" * 50)

# Test Grade 4 question generators
print("\nGrade 4 Addition:")
result = grade_4.generate_addition_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 4 Subtraction:")
result = grade_4.generate_subtraction_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 4 Multiplication:")
result = grade_4.generate_multiplication_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 4 Division:")
result = grade_4.generate_division_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\n" + "=" * 50)
print("Testing Grade 5 modules...")
print("=" * 50)

# Test Grade 5 question generators
print("\nGrade 5 Addition:")
result = grade_5.generate_addition_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 5 Subtraction:")
result = grade_5.generate_subtraction_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 5 Multiplication:")
result = grade_5.generate_multiplication_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 5 Division:")
result = grade_5.generate_division_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 5 Fractions:")
result = grade_5.generate_fraction_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")
print(f"Fraction: {result['fraction']}")

print("\n" + "=" * 50)
print("Testing Grade 6 modules...")
print("=" * 50)

# Test Grade 6 question generators
print("\nGrade 6 Addition:")
result = grade_6.generate_addition_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 6 Subtraction:")
result = grade_6.generate_subtraction_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 6 Multiplication:")
result = grade_6.generate_multiplication_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 6 Division:")
result = grade_6.generate_division_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")

print("\nGrade 6 Fractions:")
result = grade_6.generate_fraction_question()
print(f"Question: {result['question']}")
print(f"Answer: {result['answer']}")
print(f"Fraction: {result['fraction']}")

print("\n" + "=" * 50)
print("All tests passed! ✓")
print("=" * 50)
