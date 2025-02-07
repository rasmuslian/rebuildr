
loop through all files in the current directory
for file in *; do
  # Skip directories
  if [[ -f "$file" ]]; then
    # Convert filename to lowercase
    lower_file=$(echo "$file" | tr '[:upper:]' '[:lower:]')
    
    # Rename only if the lowercase version is different
    if [[ "$file" != "$lower_file" ]]; then
      mv "$file" "$lower_file"
      echo "Renamed: $file -> $lower_file"
    fi
  fi
done
