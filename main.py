#!/usr/bin/env python3
"""
Codex Code Generator - Main Script

This script demonstrates how to use OpenAI's API (GPT models with Codex capabilities)
for intelligent code generation, completion, and automation.

Usage:
    python main.py                    # Interactive mode
    python main.py "your prompt"      # Direct prompt mode
"""

import os
import sys
from openai import OpenAI
from dotenv import load_dotenv
import json
from pathlib import Path

# Load environment variables from .env file
load_dotenv()


class CodexGenerator:
    """Main class for interacting with OpenAI's Codex capabilities."""
    
    def __init__(self):
        """Initialize the Codex generator with API credentials."""
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError(
                "OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.\n"
                "Get your API key from: https://platform.openai.com/api-keys"
            )
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = os.getenv('MODEL_NAME', 'gpt-4')
        self.max_tokens = int(os.getenv('MAX_TOKENS', 1000))
        self.temperature = float(os.getenv('TEMPERATURE', 0.7))
    
    def generate_code(self, prompt, language=None):
        """
        Generate code based on a natural language prompt.
        
        Args:
            prompt (str): The natural language description of the code to generate
            language (str, optional): Programming language to target
        
        Returns:
            str: Generated code
        """
        system_message = "You are an expert programmer assistant. Generate clean, efficient, and well-commented code based on user requests."
        
        if language:
            system_message += f" Generate code in {language}."
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Error generating code: {str(e)}"
    
    def complete_code(self, partial_code, context=""):
        """
        Complete partial code using Codex.
        
        Args:
            partial_code (str): Incomplete code snippet
            context (str, optional): Additional context about what to complete
        
        Returns:
            str: Completed code
        """
        prompt = f"Complete the following code:\n\n{partial_code}"
        if context:
            prompt += f"\n\nContext: {context}"
        
        return self.generate_code(prompt)
    
    def explain_code(self, code):
        """
        Generate an explanation for given code.
        
        Args:
            code (str): Code to explain
        
        Returns:
            str: Explanation of the code
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful code explainer. Provide clear, concise explanations of code."},
                    {"role": "user", "content": f"Explain this code:\n\n{code}"}
                ],
                max_tokens=self.max_tokens,
                temperature=0.3
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Error explaining code: {str(e)}"
    
    def refactor_code(self, code, goal="improve readability and efficiency"):
        """
        Refactor existing code.
        
        Args:
            code (str): Code to refactor
            goal (str): Refactoring goal
        
        Returns:
            str: Refactored code
        """
        prompt = f"Refactor the following code to {goal}:\n\n{code}"
        return self.generate_code(prompt)
    
    def debug_code(self, code, error_message=""):
        """
        Debug code and suggest fixes.
        
        Args:
            code (str): Code with potential bugs
            error_message (str, optional): Error message if available
        
        Returns:
            str: Debugged code with explanations
        """
        prompt = f"Debug and fix the following code:\n\n{code}"
        if error_message:
            prompt += f"\n\nError message: {error_message}"
        
        return self.generate_code(prompt)


def interactive_mode():
    """Run the generator in interactive mode."""
    print("="*60)
    print("OpenAI Codex Code Generator - Interactive Mode")
    print("="*60)
    print("\nAvailable commands:")
    print("  1. generate - Generate code from description")
    print("  2. complete - Complete partial code")
    print("  3. explain - Explain code")
    print("  4. refactor - Refactor code")
    print("  5. debug - Debug code")
    print("  6. quit - Exit the program")
    print("="*60)
    
    try:
        generator = CodexGenerator()
    except ValueError as e:
        print(f"\nError: {e}")
        return
    
    while True:
        print("\nWhat would you like to do?")
        command = input("Enter command (1-6): ").strip().lower()
        
        if command in ['6', 'quit', 'exit']:
            print("\nThank you for using Codex Code Generator!")
            break
        
        elif command in ['1', 'generate']:
            print("\nDescribe the code you want to generate:")
            prompt = input("> ")
            language = input("Programming language (optional, press Enter to skip): ").strip()
            
            print("\n" + "="*60)
            print("Generated Code:")
            print("="*60)
            result = generator.generate_code(prompt, language if language else None)
            print(result)
        
        elif command in ['2', 'complete']:
            print("\nEnter partial code (type 'END' on a new line when done):")
            lines = []
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                lines.append(line)
            partial_code = '\n'.join(lines)
            context = input("Additional context (optional): ").strip()
            
            print("\n" + "="*60)
            print("Completed Code:")
            print("="*60)
            result = generator.complete_code(partial_code, context)
            print(result)
        
        elif command in ['3', 'explain']:
            print("\nEnter code to explain (type 'END' on a new line when done):")
            lines = []
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                lines.append(line)
            code = '\n'.join(lines)
            
            print("\n" + "="*60)
            print("Explanation:")
            print("="*60)
            result = generator.explain_code(code)
            print(result)
        
        elif command in ['4', 'refactor']:
            print("\nEnter code to refactor (type 'END' on a new line when done):")
            lines = []
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                lines.append(line)
            code = '\n'.join(lines)
            goal = input("Refactoring goal (optional): ").strip()
            
            print("\n" + "="*60)
            print("Refactored Code:")
            print("="*60)
            result = generator.refactor_code(code, goal if goal else "improve readability and efficiency")
            print(result)
        
        elif command in ['5', 'debug']:
            print("\nEnter code to debug (type 'END' on a new line when done):")
            lines = []
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                lines.append(line)
            code = '\n'.join(lines)
            error = input("Error message (optional): ").strip()
            
            print("\n" + "="*60)
            print("Debug Result:")
            print("="*60)
            result = generator.debug_code(code, error)
            print(result)
        
        else:
            print("Invalid command. Please enter a number between 1-6 or a valid command name.")


def direct_mode(prompt):
    """Generate code directly from command line argument."""
    try:
        generator = CodexGenerator()
        print("\nGenerating code...\n")
        result = generator.generate_code(prompt)
        print(result)
    except ValueError as e:
        print(f"\nError: {e}")


def main():
    """Main entry point for the script."""
    if len(sys.argv) > 1:
        # Direct mode: generate code from command line argument
        prompt = ' '.join(sys.argv[1:])
        direct_mode(prompt)
    else:
        # Interactive mode
        interactive_mode()


if __name__ == "__main__":
    main()
