import sys
import os
import pandas as pd
from tabula import read_pdf
from PyPDF2 import PdfReader


def get_total_pages(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        return len(reader.pages)
    except Exception as e:
        print(f"Error reading PDF: {e}", file=sys.stderr)
        sys.exit(1)


def pdf_to_csv(pdf_path, output_csv, batch_size=50):
    total_pages = get_total_pages(pdf_path)
    all_dfs = []

    page_num = 1

    while page_num <= total_pages:
        end_page = min(page_num + batch_size - 1, total_pages)

        try:
            dfs = read_pdf(pdf_path, pages=f"{page_num}-{end_page}", multiple_tables=True, lattice=True)
        except Exception as e:
            print(f"Error processing pages {page_num}-{end_page}: {e}", file=sys.stderr)
            sys.exit(1)

        if dfs:
            all_dfs.extend(dfs)

        page_num += batch_size

    if all_dfs:
        all_tables = pd.concat(all_dfs, ignore_index=True)
        all_tables.to_csv(output_csv, index=False)
    else:
        print("No tables found in the PDF.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_tables.py <pdf_path>", file=sys.stderr)
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_csv = os.path.abspath(pdf_path.replace('.pdf', '.csv'))

    try:
        pdf_to_csv(pdf_path, output_csv)
        # Only print the final CSV path
        print(output_csv)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
        
