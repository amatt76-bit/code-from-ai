# Code from AI - OpenAI Codex Integration

## Overview

This repository provides a complete setup for leveraging OpenAI's Codex API for intelligent code generation, completion, and automation. Codex is a powerful AI model that translates natural language into code and assists with various programming tasks.

## Purpose

This project demonstrates how to:
- Generate code from natural language descriptions
- Get intelligent code completions and suggestions
- Automate repetitive coding tasks
- Refactor and optimize existing code
- Generate documentation and comments
- Debug and fix code issues

## Features

- **Code Generation**: Transform natural language prompts into functional code
- **Smart Completions**: Context-aware code completion powered by Codex
- **Multi-Language Support**: Works with Python, JavaScript, TypeScript, and more
- **Easy Configuration**: Simple setup with environment variables
- **Example Scripts**: Ready-to-use examples demonstrating Codex capabilities

## Prerequisites

- Python 3.7 or higher
- An OpenAI API key (get one at https://platform.openai.com/api-keys)
- Basic understanding of Python

## Installation

1. Clone this repository:
```bash
git clone https://github.com/amatt76-bit/code-from-ai.git
cd code-from-ai
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your OpenAI API key:
   - Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

## Usage

### Basic Code Generation

Run the main script to generate code from natural language:

```bash
python main.py
```

This will prompt you to describe what code you want to generate, and Codex will create it for you.

### Using the API Directly

You can also use the Codex API directly in your own scripts:

```python
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Generate code
response = client.chat.completions.create(
    model="gpt-4",  # or "gpt-3.5-turbo"
    messages=[
        {"role": "system", "content": "You are a helpful coding assistant."},
        {"role": "user", "content": "Write a Python function to calculate fibonacci numbers"}
    ]
)

print(response.choices[0].message.content)
```

### Example Use Cases

1. **Generate a function**: "Create a Python function that sorts a list using quicksort"
2. **Code completion**: Provide partial code and let Codex complete it
3. **Refactoring**: "Refactor this code to use list comprehensions"
4. **Documentation**: "Add docstrings to this function"
5. **Bug fixing**: "Find and fix the bug in this code"

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your-api-key-here
MODEL_NAME=gpt-4  # or gpt-3.5-turbo
MAX_TOKENS=1000
TEMPERATURE=0.7
```

### Config File (Alternative)

Alternatively, you can use `config.json` for configuration:

```json
{
  "api_key": "your-api-key-here",
  "model": "gpt-4",
  "max_tokens": 1000,
  "temperature": 0.7
}
```

## Project Structure

```
code-from-ai/
├── README.md              # This file
├── main.py               # Main script for code generation
├── requirements.txt      # Python dependencies
├── .env.example         # Example environment variables
├── config.json.example  # Example configuration file
└── examples/            # Additional example scripts
```

## Integration with Development Workflow

### VS Code Extension

You can integrate Codex with VS Code using the GitHub Copilot extension or by building custom extensions that use this codebase.

### CLI Tool

Use the main script as a command-line tool:

```bash
python main.py "create a function to parse JSON files"
```

### API Integration

Import the modules in your own projects to add AI-powered code generation:

```python
from code_generator import generate_code

code = generate_code("create a REST API endpoint")
print(code)
```

## Best Practices

1. **Be Specific**: Provide clear, detailed prompts for better results
2. **Iterate**: Refine your prompts based on the output
3. **Review Code**: Always review and test generated code
4. **Use Context**: Provide relevant context in your prompts
5. **Security**: Never expose your API key in code or version control

## Troubleshooting

### API Key Issues
- Ensure your `.env` file is in the root directory
- Verify your API key is valid at https://platform.openai.com/api-keys
- Check that python-dotenv is installed

### Rate Limits
- If you hit rate limits, add delays between requests
- Consider using a different model or reducing token usage

### Import Errors
- Run `pip install -r requirements.txt` to install all dependencies
- Ensure you're using Python 3.7+

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- OpenAI for providing the Codex API
- The open-source community for inspiration and tools

## Support

For questions or issues, please open an issue on GitHub.

---

**Note**: This project uses OpenAI's GPT models (GPT-4 or GPT-3.5-turbo) as Codex has been deprecated and its functionality has been incorporated into these models. The term "Codex" in this context refers to code generation capabilities of OpenAI's models.
