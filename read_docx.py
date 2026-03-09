from docx import Document
import sys

def extract_text_from_docx(file_path):
    try:
        doc = Document(file_path)
        full_text = []
        for index, para in enumerate(doc.paragraphs):
            full_text.append(para.text)
        print('\n'.join(full_text))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        extract_text_from_docx(sys.argv[1])
    else:
        print("Please provide a file path")
