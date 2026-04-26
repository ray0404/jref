import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python get_file.py <filename>")
        sys.exit(1)

    filename = sys.argv[1]

    try:
        with open(filename, 'r') as f:
            print(f.read())
    except Exception as e:
        print(f"Error reading file {filename}: {e}")

if __name__ == "__main__":
    main()
