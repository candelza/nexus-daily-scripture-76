#!/bin/bash

# ReadBible Database Connection Script
# This script sets up environment variables for easy Supabase operations

export SUPABASE_ACCESS_TOKEN="sbp_9ce22a895a3fd657cdcdb372a0d111c9b8c807b5"
export SUPABASE_DB_PASSWORD="hNOV8LYxzsAm8uKN"
export SUPABASE_PROJECT_REF="sijdfgnypaplxihifwgi"

echo "🔌 ReadBible Database Environment Loaded"
echo "📊 Project: ReadBible (${SUPABASE_PROJECT_REF})"
echo "🌐 Region: Southeast Asia (Singapore)"
echo ""

# Function to run supabase commands with password
supabase_cmd() {
    echo "$SUPABASE_DB_PASSWORD" | supabase "$@"
}

# Export the function
export -f supabase_cmd

echo "✅ Available commands:"
echo "  supabase_cmd migration list    # List migrations"
echo "  supabase_cmd db push          # Push changes"
echo "  supabase_cmd db pull          # Pull changes"
echo "  supabase_cmd projects list    # List projects"
echo ""
echo "💡 Or use regular supabase commands (will prompt for password)"