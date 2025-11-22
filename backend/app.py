
from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import uuid
import csv
import os
from grades import grade_1, grade_2, grade_3, grade_4, grade_5, grade_6

app = Flask(__name__)
CORS(app)

# Load graph data from CSV
def load_graph_data():
    graphs = []
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'graphs', 'chart_problems.csv')
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse values, handling both integers and floats
                values = []
                for v in row['Values'].split(','):
                    try:
                        # Try to parse as float first, then convert to int if it's a whole number
                        val = float(v)
                        if val.is_integer():
                            values.append(int(val))
                        else:
                            values.append(val)
                    except ValueError:
                        values.append(0)
                
                graphs.append({
                    'id': row['ID'],
                    'questions': [row['Question1'], row['Question2'], row['Question3']],
                    'answers': [row['Answer1'], row['Answer2'], row['Answer3']],
                    'graph_type': row['GraphType'],
                    'title': row['Title'],
                    'labels': row['Labels'].split(','),
                    'values': values,
                    'min_grade': int(row['MinGrade'])
                })
    except Exception as e:
        print(f"Error loading graph data: {e}")
    return graphs

# Load word problem templates from CSV
def load_word_problem_templates(operation):
    templates = []
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'word_problems', f'{operation}_templates.csv')
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                templates.append({
                    'id': row['ID'],
                    'template': row['Template'],
                    'category': row['Category'],
                    'emoji': row['Emoji']
                })
        print(f"Loaded {len(templates)} {operation} templates")
    except Exception as e:
        print(f"Error loading {operation} templates: {e}")
    return templates

GRAPH_DATA = load_graph_data()
ADDITION_TEMPLATES = load_word_problem_templates('addition')
SUBTRACTION_TEMPLATES = load_word_problem_templates('subtraction')

# Generate random values for graph and compute answers dynamically
def generate_graph_values_and_answers(graph, grade):
    """
    Generate random values based on grade level and recalculate answers.
    Returns: (new_values, new_answers)
    """
    num_values = len(graph['values'])
    
    # Generate random values based on grade
    if grade == 5:
        # Grade 5: 2-3 digit numbers (10-99)
        new_values = [random.randint(10, 99) for _ in range(num_values)]
    else:
        # Grade 6: 3-4 digit numbers (100-999)
        new_values = [random.randint(100, 999) for _ in range(num_values)]
    
    # Map label indices to their values for answer calculation
    labels = graph['labels']
    label_value_map = {label: new_values[i] for i, label in enumerate(labels)}
    
    # Calculate answers based on question patterns
    new_answers = []
    for i, question in enumerate(graph['questions']):
        q_lower = question.lower()
        
        # "Which X has the highest/most/maximum value?"
        if ('highest' in q_lower or 'most' in q_lower or 'maximum' in q_lower):
            max_val = max(new_values)
            max_idx = new_values.index(max_val)
            new_answers.append(labels[max_idx])
        
        # "Which X has the lowest/least/minimum value?"
        elif ('lowest' in q_lower or 'least' in q_lower and 'how many' not in q_lower or 'minimum' in q_lower):
            min_val = min(new_values)
            min_idx = new_values.index(min_val)
            new_answers.append(labels[min_idx])
        
        # Question 2: "What is the total/sum?"
        elif 'total' in q_lower or 'sum' in q_lower:
            new_answers.append(str(sum(new_values)))
        
        # Question 2: "What is the average?"
        elif 'average' in q_lower:
            avg = sum(new_values) / len(new_values)
            new_answers.append(str(round(avg)))
        
        # Question 3: "How many more is X than Y?" or "How much more X than Y?"
        elif 'how many more' in q_lower or 'how much more' in q_lower:
            # Extract label names from question
            # Pattern: "How many more is A than B?" means A - B
            first_label = None
            second_label = None
            
            # Split by "than" to separate the two parts
            if ' than ' in q_lower:
                before_than, after_than = q_lower.split(' than ', 1)
                
                # Find label after "is" or "more" (this is A)
                for label in labels:
                    label_text = ''.join(c for c in label if c.isalpha() or c.isspace()).strip()
                    if label_text.lower() in before_than:
                        first_label = label
                        break
                
                # Find label after "than" (this is B)
                for label in labels:
                    label_text = ''.join(c for c in label if c.isalpha() or c.isspace()).strip()
                    if label_text.lower() in after_than and label != first_label:
                        second_label = label
                        break
                
                if first_label and second_label:
                    # Calculate A - B
                    diff = label_value_map[first_label] - label_value_map[second_label]
                    new_answers.append(str(diff))
                else:
                    # Fallback: difference between max and min
                    new_answers.append(str(max(new_values) - min(new_values)))
            else:
                # Fallback: difference between max and min
                new_answers.append(str(max(new_values) - min(new_values)))
        
        # Question: "How many X?" - specific label value
        elif 'how many' in q_lower or 'what' in q_lower and 'was' in q_lower:
            # Try to find the specific label mentioned in the question
            found = False
            for label in labels:
                # Extract text from label (remove emojis)
                label_text = ''.join(c for c in label if c.isalpha() or c.isspace()).strip()
                if label_text.lower() in q_lower:
                    new_answers.append(str(label_value_map[label]))
                    found = True
                    break
            if not found:
                # Default to first value
                new_answers.append(str(new_values[0]))
        
        else:
            # Default fallback - use original answer pattern
            new_answers.append(graph['answers'][i])
    
    return new_values, new_answers

# Generate a random question for each section using grade-specific modules
def generate_question(section, grade=6):
    # Map grade to module
    grade_modules = {
        1: grade_1,
        2: grade_2,
        3: grade_3,
        4: grade_4,
        5: grade_5,
        6: grade_6
    }
    
    # Get the appropriate grade module
    grade_module = grade_modules.get(grade)
    
    # If grade has a module and section exists, use it
    if grade_module and section in grade_module.QUESTION_GENERATORS:
        result = grade_module.QUESTION_GENERATORS[section]()
        result["id"] = str(uuid.uuid4())
        result["section"] = section
        
        # Apply word problem templates for grade 4+ (addition/subtraction only)
        if grade >= 4 and section == "addition" and ADDITION_TEMPLATES:
            template = random.choice(ADDITION_TEMPLATES)
            # Extract numbers from the generated question
            import re
            numbers = re.findall(r'\d+', result['question'])
            if len(numbers) >= 2:
                result['question'] = template['template'].replace('{a}', numbers[0]).replace('{b}', numbers[1])
        elif grade >= 4 and section == "subtraction" and SUBTRACTION_TEMPLATES:
            template = random.choice(SUBTRACTION_TEMPLATES)
            # Extract numbers from the generated question
            import re
            numbers = re.findall(r'\d+', result['question'])
            if len(numbers) >= 2:
                result['question'] = template['template'].replace('{a}', numbers[0]).replace('{b}', numbers[1])
        
        return result
    elif section == "charts":
        # Charts section is shared across all grades (with grade-specific value ranges)
        # Load a random graph from CSV data, filtered by grade
        if not GRAPH_DATA:
            # Fallback to static data if CSV not loaded
            chart_data = {
                "labels": ["Red", "Blue", "Green"],
                "values": [5, 3, 7]
            }
            questions = [
                "Which color has the highest value?",
                "What is the total of all values?",
                "How many more is Green than Blue?"
            ]
            answers = ["Green", "15", "4"]
        else:
            # Filter graphs by MinGrade
            eligible_graphs = [g for g in GRAPH_DATA if g['min_grade'] <= grade]
            if not eligible_graphs:
                eligible_graphs = GRAPH_DATA  # Fallback to all graphs if none match
            
            graph = random.choice(eligible_graphs)
            
            # Generate random values and recalculate answers
            new_values, new_answers = generate_graph_values_and_answers(graph, grade)
            
            chart_data = {
                "labels": graph['labels'],
                "values": new_values,
                "title": graph['title']
            }
            questions = graph['questions']
            answers = new_answers
        
        return {
            "id": str(uuid.uuid4()),
            "question": "Look at the graph and answer the questions below.",
            "chart": chart_data,
            "sub_questions": questions,
            "answer": answers,
            "section": section
        }
    return None

# Get a random question from a specific section (default: addition)
@app.route('/api/question', methods=['GET'])
def get_question():
    section = request.args.get('section', 'addition')
    grade = int(request.args.get('grade', 6))  # Default to grade 6
    
    q = generate_question(section, grade)
    
    if q:
        # Store the answer in a global dict for answer checking
        if 'answers' not in app.config:
            app.config['answers'] = {}
        app.config['answers'][q['id']] = q['answer']
        # For charts, include chart and sub_questions in response
        # For fractions, include fraction_visual and answer in response
        # For Grade 1 addition, include visual data
        resp = {"question": q["question"], "id": q["id"], "section": section, "answer": q.get("answer")}
        if section == "charts":
            resp["chart"] = q.get("chart")
            resp["sub_questions"] = q.get("sub_questions")
        elif section == "fractions":
            resp["fraction_visual"] = q.get("fraction_visual")
            resp["fraction"] = q.get("fraction")
        elif section == "addition" and grade == 1:
            # Include visual blocks data for Grade 1 addition
            resp["visual"] = q.get("visual")
            resp["first_number"] = q.get("first_number")
            resp["second_number"] = q.get("second_number")
        return jsonify(resp)
    return jsonify({"error": "Invalid section"}), 400



@app.route('/api/answer', methods=['POST'])
def check_answer():
    data = request.json
    question_id = data.get("id")
    user_answer = data.get("answer")
    answers = app.config.get('answers', {})
    correct_answer = answers.get(question_id)
    if correct_answer is not None:
        # Division: expect dict with quotient and remainder
        if isinstance(correct_answer, dict) and "quotient" in correct_answer and "remainder" in correct_answer:
            if (
                isinstance(user_answer, dict)
                and str(user_answer.get("quotient")) == str(correct_answer["quotient"])
                and str(user_answer.get("remainder")) == str(correct_answer["remainder"])
            ):
                correct = True
            else:
                correct = False
            return jsonify({"correct": correct, "correct_answer": correct_answer})
        # Charts: expect list of 3 answers
        if isinstance(correct_answer, list) and len(correct_answer) == 3 and isinstance(user_answer, list) and len(user_answer) == 3:
            correct = all(str(user_answer[i]).strip().lower() == str(correct_answer[i]).strip().lower() for i in range(3))
            return jsonify({"correct": correct, "correct_answer": correct_answer})
        # For fractions, allow 5% tolerance
        try:
            user_answer_f = float(user_answer)
            correct_answer_f = float(correct_answer)
            if abs(user_answer_f - correct_answer_f) <= 0.05 * abs(correct_answer_f):
                correct = True
            else:
                correct = False
        except Exception:
            correct = (user_answer == correct_answer)
        return jsonify({"correct": correct, "correct_answer": correct_answer})
    return jsonify({"error": "Question not found"}), 404

@app.route('/api/get_answer', methods=['POST'])
def get_answer():
    """Admin endpoint to get the correct answer for a question"""
    data = request.json
    question_id = data.get("id")
    answers = app.config.get('answers', {})
    correct_answer = answers.get(question_id)
    if correct_answer is not None:
        return jsonify({"answer": correct_answer})
    return jsonify({"error": "Question not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
