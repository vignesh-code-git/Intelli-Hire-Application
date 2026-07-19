import os
try:
    import pypdf
    reader = pypdf.PdfReader("../backend/Shabeeb_A_FullStack_Developer.pdf")
    for i, page in enumerate(reader.pages):
        print(f"--- Page {i+1} ---")
        print(page.extract_text())
except Exception as e:
    print("pypdf failed, trying pdfplumber...", e)
    try:
        pdfplumber = __import__('pdfplumber')
        with pdfplumber.open("../backend/Shabeeb_A_FullStack_Developer.pdf") as pdf:
            for i, page in enumerate(pdf.pages):
                print(f"--- Page {i+1} ---")
                print(page.extract_text())
    except Exception as e2:
        print("pdfplumber failed, trying fitz (PyMuPDF)...", e2)
        try:
            fitz = __import__('fitz')
            doc = fitz.open("../backend/Shabeeb_A_FullStack_Developer.pdf")
            for i, page in enumerate(doc):
                print(f"--- Page {i+1} ---")
                print(page.get_text())
        except Exception as e3:
            print("fitz failed too.", e3)
