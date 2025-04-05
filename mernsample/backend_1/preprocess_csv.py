import sys
import re
import pandas as pd

def clean_column_names(columns):
    return [re.sub(r"[./]", "_", col.strip()) for col in columns]

def preprocess_csv(input_csv, output_csv):
    try:
        # Load the CSV without assuming headers
        df = pd.read_csv(input_csv, header=None)

        # Debug: Show initial shape
        print(f"Initial DataFrame shape: {df.shape}")

        # Check if the first row contains metadata like 'Note' or 'Unnamed'
        if "Note" in str(df.iloc[0, 0]) and str(df.iloc[0, 1]).startswith("Unnamed"):
            # Drop the first row
            df = df.iloc[1:]

        # Set column headers using the first valid data row
        if "Note" in str(df.iloc[0]).lower() or df.iloc[0].isnull().all():
            df.columns = df.iloc[1]  # Use the second row as headers if the first row is invalid
            df = df[2:].reset_index(drop=True)  # Drop the first two rows
        else:
            df.columns = df.iloc[0]  # Use the first row as headers
            df = df[1:]

        # Debug: Show shape after header cleanup
        print(f"Shape after header cleanup: {df.shape}")
        
        # Clean column names
        df.columns = clean_column_names(df.columns)

        # Drop columns with all null or empty data
        df = df.dropna(how='all', axis=1)
        print(f"Shape after dropping completely empty columns: {df.shape}")

        # Save to output file if specified
        if output_csv:
            df.to_csv(output_csv, index=False)
            print(f"Processed CSV saved to {output_csv}")

        return df

    except Exception as e:
        print(f"Error during preprocessing: {e}")
        sys.exit(1)

        
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python preprocess_csv.py <input_csv> <output_csv>")
        sys.exit(1)

    input_csv = sys.argv[1]
    output_csv = sys.argv[2]

    preprocess_csv(input_csv, output_csv)
