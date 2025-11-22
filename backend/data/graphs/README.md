# Graph Questions Database

This folder contains graph data and questions for the sixth-grade math quiz.

## Files

- `graph_questions.csv`: Contains graph IDs (G001-G008), questions, answers, and graph data

## CSV Structure

Each row represents one graph with:
- **ID**: Unique identifier (G001, G002, etc.)
- **Question1, Answer1**: First question and answer
- **Question2, Answer2**: Second question and answer
- **Question3, Answer3**: Third question and answer
- **GraphType**: Type of graph (bar, line, pie, etc.)
- **Title**: Graph title
- **Labels**: Comma-separated category labels
- **Values**: Comma-separated numeric values

## Adding New Graphs

To add new graphs:
1. Add a new row to `graph_questions.csv`
2. Assign a new ID (e.g., G009)
3. Include exactly three questions with answers
4. Specify the graph type, title, labels, and values
5. Ensure labels and values are comma-separated and match in count

## Notes

- All questions are designed for sixth-grade math level
- Questions focus on reading graphs, comparing values, and basic arithmetic
- Answers can be text or numeric based on the question type
